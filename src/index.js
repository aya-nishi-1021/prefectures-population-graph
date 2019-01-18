import React from "react";
import ReactDOM from "react-dom";

import "./index.scss";

class App extends React.Component {

    state = {
        checkbox: Array(47).fill(false),
        prefectures: [], // RESAS APIから取得した「都道府県一覧」（prefCode, PrefName）
        prefTrendData: [] // RESAS APIから取得した「人口構成」（year, value）+ prefCode
    };

    componentDidMount() {
        fetch('https://opendata.resas-portal.go.jp/api/v1/prefectures', {
            headers: { 'X-API-KEY': 'laQNIVQSq86KoGBF9t0pEsDTR5h9Ejs9EXm1spwN' }
        })
        .then(response => response.json())
        .then(res => {
            // console.log(res.result); ⇨ {prefCode: 1 prefName: "北海道"},{prefCode: 2, prefName: "青森県"},,,
            // console.log(res.result[1].prefName); ⇨ 青森県
            this.setState({ prefectures: res.result });
        });
    }

    handleChangeCheckbox = index => {
        // チェックされていなかった(falseの)場合はチェックを入れる(trueに)。逆も同様
        this.state.checkbox[index] = !this.state.checkbox[index];
        this.setState({ checkbox: this.state.checkbox });
        // チェックした場合はチェックした都道府県の「人口構成」を取得し、prefCodeと一緒にprefTrendDataに追加
        if(this.state.checkbox[index]) {
            fetch(`https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?cityCode=-&prefCode=${index + 1}`, {
                headers: { 'X-API-KEY': 'laQNIVQSq86KoGBF9t0pEsDTR5h9Ejs9EXm1spwN' }
            })
            .then(response => response.json())
            .then(res => {
                // console.log(res.result.data[0].data); // 1960-2045の間で、5年毎のyearと人口
                // console.log(res.result.data[0].data[0].year); // 1960
                // console.log(res.result.data[0].data[0].value); // 1960年の人口
                // console.log(res.result.data[0].data[2].year); // 1970
                // console.log(res.result.data[0].data[2].value); // 1970年の人口
                // console.log(this.state.prefectures[index].prefName); // 都道府県の名前
                const trendData = [];
                for(var i = 0; i < 18; i++) {
                    if(i % 2 === 0) {
                        trendData.push(res.result.data[0].data[i]);
                    }
                }
                const newPrefTrendData = this.state.prefTrendData.concat({
                    prefCode: this.state.prefectures[index].prefCode,
                    data: trendData
                })
                this.setState({ prefTrendData: newPrefTrendData });
            });
        } else { // チェックを外した場合はチェックを外した都道府県の「人口構成」とprefCodeのデータをpredTrendDataから削除
            for(var i = 0; i < this.state.prefTrendData.length; i++) {
                if(this.state.prefTrendData[i].prefCode === this.state.prefectures[index].prefCode) {
                    this.state.prefTrendData.splice(i, 1);
                }
            }
            this.setState({ prefTrendData: this.state.prefTrendData });
        }
    }  

  render() {
      
    return (
        <div className="contentsWrapper">
            <h1>都道府県別の総人口推移グラフ</h1>
            <ul>
                {this.state.prefectures.map((pref, index) => {
                    return (
                        <li key={pref.prefCode}>
                            <input type="checkbox" checked={this.state.checkbox[index]} onChange={() => this.handleChangeCheckbox(index)}/>
                            <span>{pref.prefName}</span>
                        </li>
                    );
                })}
            </ul>
            <ul>
                {this.state.prefTrendData.map((data, index) => {
                    return (
                        <li key={data.prefCode}>
                            {data.data.map((d, index) => {
                                return (
                                    <span key={d.year}>
                                        {d.year}:{d.value}<br/>
                                    </span>
                                );
                            })}
                        </li>
                    );
                })}
            </ul>
            
        </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
