import React, { Component } from "react";

class EntitySection extends React.Component {
  constructor(props) {
    super(props);
    this.state = { entities: [] };
  }

  componentWillReceiveProps(nextProps) {
    Promise.resolve(
      this.setState({ entities: nextProps.entities }, () => {
        console.log("Received entities: ", JSON.stringify(this.state.entities));
      })
    ).catch(console.log.bind(console));
  }

  render() {
    console.log("ENTITYSECTION ENTITIES:", JSON.stringify(this.state.entities));
    if (this.state.entities !== undefined && this.state.entities.length !== 0) {
      var listItems = this.state.entities.map(function(entity) {
        var name = entity[0];
        return <li class="entity">{name + " (" + entity[2] + ")"}</li>;
      });
    }

    return (
      <div className="entitysection">
        <HeaderBar title={this.props.title} />
        <ul className="entitylist">{listItems}</ul>
      </div>
    );
  }
}

function HeaderBar(props) {
  return <h1> {props.title}</h1>;
}

export default EntitySection;
