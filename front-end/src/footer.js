import React, { Component } from "react";
import FileSelecter from "./fileselector.js";

class Footer extends React.Component {
  constructor(props) {
    super(props);
    this.getNafFromSelecter = this.getNafFromSelecter.bind(this);
    this.state = { naf: "", status: "" };
  }

  exists(nafFile) {
    return nafFile !== undefined && nafFile !== "" ? true : false;
  }

  getNafFromSelecter(nafFile, status = "") {
    if (nafFile == undefined || nafFile == "") {
      console.log("FOOTER getNafFromSelecter is null");
    } else if (nafFile !== undefined && nafFile !== "") {
      //console.log("FOOTER NAF", JSON.stringify(nafFile));
      Promise.resolve(
        this.setState({ naf: nafFile, status: status }, () => {
          console.log("NAF has arrived in footer");
        })
      )
        .then(() => {
          this.props.sendNafToParent(this.state.naf);
        })
        .catch(console.log.bind(console));
      //.then(console.log("FOOTER NAF STATE", JSON.stringify(this.state.naf)))
      //.then(this.props.sendNafToParent(this.state.naf));
    }
  }

  render() {
    return (
      <div className="footersection">
        <FileSelecter sendNafToParent={this.getNafFromSelecter} />
        <Status status={this.state.status} />
      </div>
    );
  }
}

function Status(props) {
  return (
    <div className="status">
      <span>Status: {props.status}</span>
    </div>
  );
}

export default Footer;
