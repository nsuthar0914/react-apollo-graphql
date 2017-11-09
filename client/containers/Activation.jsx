import React from 'react';
import {connect} from 'react-redux';
import Paper from 'material-ui/Paper';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import {browserHistory} from 'react-router'


import ConfirmDialog from '../components/ConfirmDialog.jsx';
import CircularProgress from 'material-ui/CircularProgress';

import {
    gql,
    graphql,
    compose,
} from 'react-apollo';

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
    this.props.activation({ 
      variables: {
        email: email,
        token: token,
      },
    }).then((success) => {
      if (success.data.activation && success.data.activation.viewer.isActivated) {
        this.setState({
          activating: false,
        });
      } else if (success.data.activation && !success.data.activation.viewer.isActivated) {
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

const activationMutation = gql`
  mutation activationMutation (
    $email: String!
    $token: String!
  ) {
    activation (input: {email: $email, token: $token}) {
      viewer {
        id
        name
        email
        token
        isAdmin
        isSuperUser
        isActivated
      }
    }
  }
`;

export default compose(
  graphql(activationMutation, {name: 'activation'}),
)(Activation);
