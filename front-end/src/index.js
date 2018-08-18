import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import Container from "./container.js";
import Footer from "./footer.js";

class ViewPort extends React.Component {
  constructor(props) {
    super(props);
    this.getNafFromChild = this.getNafFromChild.bind(this);
    this.state = { naf: "" };
  }
  getNafFromChild(nafFile) {
    //console.log("VIEWPORT IN NAF", JSON.stringify(nafFile));
    if (nafFile !== undefined && nafFile !== "") {
      Promise.resolve(
        this.setState({ naf: nafFile }, () => {
          console.log("VIEWPORT NAF STATE", JSON.stringify(this.state.naf));
        })
      ).catch(console.log.bind(console));
    }
  }

  render() {
    return (
      <div className="viewport">
        <Container nafFile={this.state.naf} />
        <Footer sendNafToParent={this.getNafFromChild} />
      </div>
    );
  }
}

ReactDOM.render(<ViewPort />, document.getElementById("root"));
