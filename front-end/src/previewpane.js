import React, {Component} from 'react';

class PreviewPane extends React.Component {
    constructor(props) {
      super(props);
      this.handleChange = this.handleChange.bind(this);
      this.state = {temperature: ''};
    }
  
    handleChange(e) {
      this.setState({temperature: e.target.value});
    }
  
    render() {
      return (<div className='previewpane'>
      <HeaderBar title='Preview'/>
      <PreviewComponent/>
      </div>);
    }
}

function PreviewComponent (props) {
    return (<div className='detailscomponent' id='preview'><h3>Preview Text Here</h3></div>);
}

function HeaderBar (props) {
    return (<h1> {props.title}</h1>);
}

export default PreviewPane;