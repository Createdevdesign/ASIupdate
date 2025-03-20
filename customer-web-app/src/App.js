import React from 'react';
// import {BrowserRouter as Router} from 'react-router-dom';
// import Header from './components/Header';
import RoutingSection from './components/RoutingSection';
import {DataProvider} from './components/Context';
import NetworkDetector from './NetworkDetector';

class App extends React.Component{
  render(){
    return (
      <DataProvider>
        <div className="app">
            {/* <Header /> */}
            <RoutingSection />
        </div>
      </DataProvider>
    )
  }
}

export default NetworkDetector(App);
