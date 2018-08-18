import React, { Component } from "react";
import PreviewPane from "./previewpane.js";
import DetailsPane from "./detailspane.js";

class Container extends React.Component {
  constructor(props) {
    super(props);
    this.state = { naf: "" };
  }

  componentWillReceiveProps(newProps) {
    this.setState({ naf: newProps.nafFile }, () => {
      console.log("NEW PROPS CONTAINER ", JSON.stringify(this.state.naf));
    });
  }

  render() {
    console.log("CONTAINER NAF", JSON.stringify(this.props.nafFile));
    return (
      <div className="container">
        <PreviewPane />
        <DetailsPane nafFile={this.state.naf} />
      </div>
    );
  }
}

export default Container;
