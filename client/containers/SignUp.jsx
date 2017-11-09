import React from 'react';
import {connect} from 'react-redux';
import Paper from 'material-ui/Paper';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import {browserHistory} from 'react-router'
import CircularProgress from 'material-ui/CircularProgress';

import {
    gql,
    graphql,
    compose,
} from 'react-apollo';

import ConfirmDialog from '../components/ConfirmDialog.jsx';

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
class SignUp extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      name:'',
      email:props.params.email,
      token:props.params.token,
      password:'',
    }
    this.handleFieldChange = this.handleFieldChange.bind(this);
  }
  handleFieldChange(e,field){
    this.setState({
      [field]:e.target.value,
    })
  }

  handleSignup(e){
    e.preventDefault();

    let dataStr = `email: "${this.state.email}", password: "${this.state.password}"`;
    if (this.state.name) dataStr += `, name: "${this.state.name}"`
    if (this.state.token) dataStr += `, token: "${this.state.token}"`
    this.props.signup({ 
      variables: {
        email: this.state.email,
        password: this.state.password,
        name: this.state.name,
        token: this.state.token,
      },
    }).then((success) => {
      if (success.data.signup && success.data.signup.viewer.isActivated) {
        this.confirm.openDialog({
          message: (this.state.token
            ? 'Password Changed. Please proceed to login.'
            : 'You are already activated. Please proceed to login.'),
          handleConfirm: () => browserHistory.push('/signin')
        });
      } else if (success.data.signup && !success.data.signup.viewer.isActivated) {
        this.confirm.openDialog({
          message: (this.state.token
            ? 'Please check your inbox to re-activate your account.'
            : 'Please check your inbox to activate your account.'),
          handleConfirm: () => browserHistory.push('/')
        });
      }
    }, error => {
      console.log(error);
    });
  }

  render(){
    if (this.props.fetching) {
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
          <form onSubmit={(e) => this.handleSignup(e)}>
            <p><span>WELCOME</span></p>
            {!this.state.token
              ? <TextField
                value={this.state.name}
                onChange={(e) => this.handleFieldChange(e, 'name')}
                style={styles.textField} 
                floatingLabelText="Name"
                fullWidth
              /> : null}
            <TextField
              value={this.state.email}
              onChange={(e) => this.handleFieldChange(e, 'email')}
              style={styles.textField} 
              floatingLabelText="Email"
              disabled={!!this.state.token}
              fullWidth
            />
            <TextField
              value={this.state.password}
              onChange={(e) => this.handleFieldChange(e, 'password')}
              style={styles.textField}
              floatingLabelText={this.state.token ? 'New Password' : 'Password'}
              type="password"
              fullWidth
            />
            <br />
            <RaisedButton
              primary={true}
              type="submit"
              label={this.state.token ? "Reset Password" : "Sign Up"}
              disabled={this.props.fetching}
            />
          </form>
          <br />
          <FlatButton
            href="/signin"
            label="Already An User? Sign In"
          />
        </Paper>
        <ConfirmDialog ref={e => {this.confirm = e;}}/>
      </div>
    );
  }
}

const signupMutation = gql`
  mutation signupMutation (
    $email: String!
    $password: String!
  ) {
    signup (input: {email: $email, password: $password}) {
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
  graphql(signupMutation, {name: 'signup'}),
)(SignUp);