import React, { Component } from "react";
import DetailsComponent from "./detailscomponent.js";

class DetailsPane extends React.Component {
    constructor(props) {
      super(props);
      this.state = {}; 
    }
    
  
    render() {
      console.log('DETAILS NAF', JSON.stringify(this.props.nafFile));
      return (<div className='detailspane'>
        <HeaderBar title='Details'/>
        <DetailsComponent nafFile = {this.props.nafFile} />
        </div>);
    }
  }

function HeaderBar (props) {
    return (<h1> {props.title}</h1>);
}

export default DetailsPane;