import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          <a onClick={(event) => fetch('/whatever', {accept: "application/json"}).then(res => res.json()).then(res => console.log(res))}>Hello world!</a>
        </p>
      </div>
    );
  }
}

export default App;
