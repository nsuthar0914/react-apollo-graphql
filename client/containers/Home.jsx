import React from 'react';
import {connect} from 'react-redux';


class Home extends React.Component {
  constructor(props) {
    super(props);
  }
  render(){
    console.log(this.props);
    return (
      <div>
      Home
      </div>
    );
  }
}

export default Home;
