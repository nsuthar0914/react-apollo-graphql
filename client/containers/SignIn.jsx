import React from 'react';
import {connect} from 'react-redux';
import Paper from 'material-ui/Paper';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import {browserHistory} from 'react-router';
import CircularProgress from 'material-ui/CircularProgress';

import {
    gql,
    graphql,
    compose,
} from 'react-apollo';

import AlertDialog from '../components/AlertDialog.jsx';

const styles={
  paper:{
    width: '360px',
    height: '380px',
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
class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      didForgetPassword:false,
      email:'',
      password:'',
    }
    this.toggleForgotPassword = this.toggleForgotPassword.bind(this);
    this.handleFieldChange = this.handleFieldChange.bind(this);
  }
  handleFieldChange(e,field){
    this.setState({
      [field]:e.target.value,
    })
  }
  toggleForgotPassword(){
    this.setState({
      didForgetPassword:!this.state.didForgetPassword,
      password: !this.state.didForgetPassword ? undefined : '',
    })
  }

  handleLogin(e){
    e.preventDefault();
    this.props.login({ 
      variables: {
        email: this.state.email,
        password: this.state.password,
      },
    }).then((success) => {
      const {email, token, isRecruiter, isAuthor, isAdmin, isSuperUser, isActivated} = success.data.login.viewer;
      
      if (email) {
        if (isActivated) {
          if (this.state.didForgetPassword) {
            this.alert.openDialog({
              message: "Please check your inbox for password-rest link."
            });
          } else if (token) {
            localStorage.setItem('token', token);
            browserHistory.push('/');
          }
        } else {
          this.alert.openDialog({
            message: "Account is not activated yet. Please check your inbox for activation link or try signing up again."
          });
        }
      } else {
        this.alert.openDialog({
          message: !this.state.didForgetPassword
            ? "Could not log in with these credentials. Please sign up if you are a new user."
            : "Could not find user with these credentials. Please sign up if you are a new user."
        });
      }
    }, error => {
      this.alert.openDialog({
        message: "Server error. Please try again later."
      });
      console.log(error);
    });
  }

  render(){
    const {didForgetPassword} = this.state;
    let passwordField;
    if (didForgetPassword) {
      passwordField = (
        
        <p>You will receive password reset instructions by email.</p>
        
        );
    } else {
      passwordField = (
        <TextField
          onChange={(e) => this.handleFieldChange(e, 'password')}
          style={styles.textField}
          floatingLabelText="Password"
          type="password"
          fullWidth
        />      
      );
    }
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
          <form onSubmit={(e) => this.handleLogin(e)}>
            <p><span>WELCOME</span></p>
            <TextField
              onChange={(e) => this.handleFieldChange(e, 'email')}
              style={styles.textField} 
              floatingLabelText="Email"
              fullWidth
            />
            {passwordField}
            <br />
            <RaisedButton
              primary={true}
              type="submit"
              disabled={this.props.fetching}
              label={didForgetPassword ? "Send reset email" : "Login"}
            />
          </form>
          <br />
          <FlatButton
            onClick={(e) => {e.preventDefault(); this.toggleForgotPassword();}}
            label={didForgetPassword ? "Cancel" : "Forgotten password?"}
          />
          <FlatButton
            href="/signup"
            label="Sign Up"
          />
        </Paper>
        <AlertDialog ref={e => {this.alert = e;}}/>
      </div>
    );
  }
}

const loginMutation = gql`
  mutation loginMutation (
    $email: String!
    $password: String!
  ) {
    login (input: {email: $email, password: $password}) {
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
  graphql(loginMutation, {name: 'login'}),
)(Login);
