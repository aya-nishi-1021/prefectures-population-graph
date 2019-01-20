import React from "react";
import ReactDOM from "react-dom";
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts';
import apiKey from './apiKey';
import "./index.scss";

// 47つのカラーコードを生成
const colors = [];
for(var i = 0; i < 47; i++) {
    let r = ('0' + Math.floor(Math.random() * 255).toString(16)).slice(-2);
    let g = ('0' + Math.floor(Math.random() * 255).toString(16)).slice(-2);
    let b = ('0' + Math.floor(Math.random() * 255).toString(16)).slice(-2);
    let color = '#' + r + g + b;
    colors.push(color);
}

class App extends React.Component {  
    state = {
        checkbox: Array(47).fill(false),
        prefectures: [], // RESAS APIから取得した「都道府県一覧」（prefCode, PrefName）
        trendData: [
            { year: 1960 },
            { year: 1970 },
            { year: 1980 }, 
            { year: 1990 },
            { year: 2000 },
            { year: 2010 },
            { year: 2020 },
            { year: 2030 },
            { year: 2040 }
        ], // RESAS APIから取得した「人口構成」（value）+ prefName
        colorCode: colors
    };

    componentDidMount() {
        fetch('https://opendata.resas-portal.go.jp/api/v1/prefectures', {
            headers: { 'X-API-KEY': apiKey }
        })
        .then(response => response.json())
        .then(res => {
            this.setState({ prefectures: res.result });
        });
    }

    handleChangeCheckbox = index => {
        // チェックされていなかった(falseの)場合はチェックを入れる(trueに)。逆も同様
        this.state.checkbox[index] = !this.state.checkbox[index];
        this.setState({ checkbox: this.state.checkbox });
        // チェックした場合はチェックした都道府県の「人口構成」を取得し、prefNameと一緒にtrendDataに追加
        if(this.state.checkbox[index]) {
            fetch(`https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?cityCode=-&prefCode=${index + 1}`, {
                headers: { 'X-API-KEY': apiKey }
            })
            .then(response => response.json())
            .then(res => {
                // チェックした都道府県の名前
                const thisPrefName = this.state.prefectures[index].prefName;
                const trendDataCopy = this.state.trendData.slice();
                // チェックした都道府県の10年毎の人口データをtrendDataに追加
                for(var i = 0; i < res.result.data[0].data.length; i++) {
                     for(var j = 0; j < trendDataCopy.length; j++) {
                         if(res.result.data[0].data[i].year === trendDataCopy[j].year) {
                            trendDataCopy[j][thisPrefName] = res.result.data[0].data[i].value
                         }
                     }
                 }
                 this.setState({ trendData: trendDataCopy });
                 console.log(this.state.trendData);
            });
        } else { // チェックを外した場合はチェックを外した都道府県のデータをtrendDataから削除
            // チェックを外した都道府県の名前
            const thisPrefName = this.state.prefectures[index].prefName;
            const trendDataCopy = this.state.trendData.slice();
            // チェックを外した都道府県の人口データをtrendDataから削除
            for(var i = 0; i < trendDataCopy.length; i++) {
                delete trendDataCopy[i][thisPrefName];
            }
            this.setState({ trendData: trendDataCopy });
            console.log(this.state.trendData);
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
            
            <div className="graphWrapper">
                <LineChart width={1200} height={800}  margin={{left: 30, right: 10}} data={this.state.trendData}>
                    <CartesianGrid stroke="#ccc" strokeDasharray="5 5"/>
                    <XAxis dataKey='year' />
                    <YAxis />
                    {this.state.prefectures.map((pref, index) => {
                        return (
                            <Line type="monotone" dataKey={pref.prefName} stroke={this.state.colorCode[index]} key={pref.prefCode}/>
                        );
                    })}   
                    <Tooltip />
                    <Legend />                    
                </LineChart>
            </div>
        </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);