import React from 'react';
import {connect} from 'react-redux';
import Paper from 'material-ui/Paper';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import {browserHistory} from 'react-router'

import {activation} from '../actions/login.actions';

import ConfirmDialog from '../components/ConfirmDialog.jsx';
import CircularProgress from 'material-ui/CircularProgress';

const styles={
  paper:{
    width: '360px',
    padding: '30px 20px 20px',
    position: 'relative',
    textAlign: 'center',
    margin: '0 auto',
  },
  textField: {
    display: 'block',
  },
  loginView:{
    
  },
}
class Activation extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      activating: true,
      error: "",
    }
    this.handleActivation = this.handleActivation.bind(this);
    this.handleActivation();
  }

  handleActivation(){
    const {viewer, params: {email, token}} = this.props;

    let dataStr = `email: "${email}", token: "${token}"`;
    this.props.activation(`mutation{activation(input: {${dataStr}}){viewer{id, name, email, isActivated}}}`).then((success) => {
      if (success.activation && success.activation.viewer.isActivated) {
        this.setState({
          activating: false,
        });
      } else if (success.activation && !success.activation.viewer.isActivated) {
        this.setState({
          activating: false,
          error: 'Could not activate. Try again later'
        });
      }
    }, error => {
      this.setState({
        activating: false,
        error: JSON.stringify(error)
      });
      console.log(error);
    });
  }

  render(){
    if (this.state.activating) {
      return (<div 
        style={{
          top: '50%',
          left: '50%',
          position: 'absolute',
          zIndex: '15'
        }}
      >
        <CircularProgress size={80} thickness={5} />
      </div>);
    }
    return(
      <div style={styles.loginView}>
        <Paper style={styles.paper}>
          {this.state.error
            ? <div>
              <p>{this.state.error}</p>
              <FlatButton
                href="/signup"
                label="Sign Up"
              />
            </div> : <div>
              <p>Activation Successful. Proceed to login.</p>
              <FlatButton
                href="/signin"
                label="Sign In"
              />
            </div>}
        </Paper>
        <ConfirmDialog ref={e => {this.confirm = e;}}/>
      </div>
    );
  }
}

export default connect(
  (state) => {
    return {
      user: state.login.get("user"),
    };
  },
  (dispatch) => {
    return {
      activation: (payload) => dispatch(activation(payload))
    };
  }
)(Activation);