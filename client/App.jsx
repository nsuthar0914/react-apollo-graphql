import React from 'react';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';
import muiTheme from './theme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
import './styles/app.css';
import Header from './components/layout/header.jsx';
import Footer from './components/layout/footer.jsx';

import {logout} from './actions/login.actions.js';

injectTapEventPlugin();
class App extends React.Component{
  logout() {
    Promise.resolve(this.props.logout()).then(() => browserHistory.push('/'));
  }
  render(){
    const {user, pages} = this.props;
    console.log(user)
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div>
          <Header viewer={user} pages={pages} logout={() => this.logout()}/>
          <div className="body-content">
            {this.props.children}
          </div>
          <Footer />
        </div>
      </MuiThemeProvider>
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
      logout: () => dispatch(logout()),
    };
  }
)(App);




// export var App = Relay.createContainer(
//   _App,
//   {
//     fragments: {
//       viewer: () => Relay.QL`
//         fragment on User {
//           name
//           email
//         }
//       `,
//     },
//   },
// )
