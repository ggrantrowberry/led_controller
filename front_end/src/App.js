import React, { Component } from 'react';
import './App.css';
import axios from 'axios';


const serverAddress = "http://192.168.4.1:5000"

const CANDLECOUNT = 24;

class App extends Component {
  constructor(props){
    super(props);

    //Set up the buttons
    let candle_data = [];
    for(let i = 0; i < CANDLECOUNT; i++){
      candle_data.push({
        id: i, 
        state: 0
      });
    }

    this.state={
      candle_data: candle_data,
      //ventSource: new EventSource(serverAddress+"/stream")
    }

    //this.eventSource = new EventSource(serverAddress+"/stream");

  }  

  componentDidMount() {
    this.interval = setInterval(() => {
      this.getStates();
    }, 200);
    // this.eventSource.onmessage = e => {
    //   this.updateCandles(JSON.parse(e.data))};
    //this.state.eventSource.addEventListener('candle_update', (e) => { console.log(e); this.updateCandles(JSON.parse(e.data));});
  }

  getStates = () => {
    axios.get(serverAddress+"/get_states")
    .then(res => {
      console.log(res.data);
      let candleStates = res.data;

      this.setState(prevState => {
        let newState = prevState;
        console.log(candleStates);
        if(candleStates.length !== newState.candle_data.length){
  
          console.log("Candle state lengths are not the same");
  
        } else {
  
          for(let i = 0; i < newState.candle_data.length; i++){
            newState.candle_data[i].state = candleStates[i];
          }
  
        }
  
        return newState
      });
    })
  }

  updateCandles = (candleStates) => {
    console.log("candleState", candleStates);
    this.setState(prevState => {
      let newState = prevState;
      console.log(candleStates);
      if(candleStates.length !== newState.candle_data.length){

        console.log("Candle state lengths are not the same");

      } else {

        for(let i = 0; i < newState.candle_data.length; i++){
          newState.candle_data[i].state = candleStates[i];
        }

      }

      return newState
    });
  }


  render() {
    return (
      <div className="App" style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <div style={{display:'flex', flexFlow: 'row wrap', justifyContent: 'center'}}>
          <ButtonDeck
            candle_data={this.state.candle_data}
          />
        </div>

      </div>
    );
  }
}

function ButtonDeck(props){
  return props.candle_data.map((button_data) => {
    return (
      <Button
        id={button_data.id}
        key={button_data.id}
        candleState={button_data.state}
      ></Button>
    );
  }) 
}

class Button extends Component{
  handleCandlePress = () => {
    axios.post(serverAddress+"/switch", { candleID: this.props.id, candleState: !this.props.candleState })
    .then(res => {
      console.log(res);
      console.log(res.data);
    })
  }

  render() {
    let backgroundColor = '#99A3A4';
    let outlineColor = '#515A5A';
    if(this.props.candleState){
      backgroundColor = '#F5B041';
      outlineColor = '#D35400'
    }
    return (
      <div style={{height: '10vh', width: '10vh', backgroundColor: backgroundColor, 
        borderStyle: 'solid', borderColor: outlineColor, margin: '20px', borderRadius: '5px', borderWidth: '7px'}}
        onClick={this.handleCandlePress}
      >
        {this.props.id}
      </div>
    )
  }
}

export default App;
