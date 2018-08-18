import React, { Component } from "react";
import EntitySection from "./entitysection.js";

class DetailsComponent extends React.Component {
  constructor(props) {
    super(props);
    this.setEntities = this.setEntities.bind(this);
    this.state = {
      naf: "",
      personEntities: [],
      locationEntities: [],
      organizationEntities: []
    };
  }

  componentWillReceiveProps(nextProps) {
    Promise.resolve(
      this.setState({ naf: nextProps.nafFile }, () => {
        this.setEntities(this.state.naf);
      })
    ).catch(console.log.bind(console));
  }

  setEntities(splittedEntities) {
    if (splittedEntities[0] !== undefined && splittedEntities[0] !== "") {
      this.setState({ personEntities: splittedEntities[0] });
    }
    if (splittedEntities[1] !== undefined && splittedEntities[1] !== "") {
      this.setState({ locationEntities: splittedEntities[1] });
    }

    if (splittedEntities[2] !== undefined && splittedEntities[2] !== "") {
      this.setState({ organizationEntities: splittedEntities[2] });
    }
  }

  render() {
    console.log(
      "DETAILSCOMPONENT NAF (PERSONS)",
      JSON.stringify(this.state.personEntities)
    );
    return (
      <div className="detailscomponent">
        <EntitySection title="Persons" entities={this.state.personEntities} />
        <EntitySection
          title="Locations"
          entities={this.state.locationEntities}
        />
        <EntitySection
          title="Organisations"
          entities={this.state.organizationEntities}
        />
      </div>
    );
  }
}

export default DetailsComponent;
