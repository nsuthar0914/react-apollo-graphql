import React from 'react';
import {connect} from 'react-redux';
import {browserHistory} from 'react-router';
import muiTheme from './theme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
import './styles/app.css';
import Header from './components/layout/header.jsx';
import Footer from './components/layout/footer.jsx';

import {
    gql,
    graphql,
    compose,
} from 'react-apollo';

injectTapEventPlugin();
class App extends React.Component {
  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    browserHistory.push('/');
  }
  render(){
    const {data} = this.props;
    const {loading, error, viewer} = data || {};
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div>
          <Header viewer={viewer || {}} logout={() => this.logout()}/>
          <div className="body-content">
            {this.props.children}
          </div>
          <Footer />
        </div>
      </MuiThemeProvider>
    );
  }
}

export const viewerQuery = gql`
  query ViewerQuery {
    viewer {
      id
      name
      email
      isAdmin
      isSuperUser
      isActivated
    }
  }
`;

export default compose(
  graphql(viewerQuery, {
    skip: () => !localStorage.getItem('token'),
    options: { pollInterval: 5000 },
  }),
)(App);