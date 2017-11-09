import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, browserHistory } from 'react-router';

import {
  ApolloClient,
  ApolloProvider,
  createNetworkInterface,
  toIdValue,
} from 'react-apollo';

import routes from './routes.jsx';

const networkInterface = createNetworkInterface({ uri: 'http://localhost:3000/graphql' });
networkInterface.use([{
  applyMiddleware(req, next) {
    if (!req.options.headers) {
      req.options.headers = {}; // Create the header object if needed.
    }
    let token = localStorage.getItem('token')
    if (token) {
      req.options.headers['Authorization'] = `Bearer ${token}`;
    }
    next();
  },
}]);
function dataIdFromObject (result) {
  if (result.__typename) {
    if (result.id !== undefined) {
      return `${result.__typename}:${result.id}`;
    }
  }
  return null;
}

const client = new ApolloClient({
  networkInterface,
  // customResolvers: {
  //   Query: {
  //     channel: (_, args) => {
  //       return toIdValue(dataIdFromObject({ __typename: 'Channel', id: args['id'] }))
  //     },
  //   },
  // },
  dataIdFromObject,
});


ReactDOM.render((
  <ApolloProvider client={client}>
    <Router history={browserHistory} routes={routes()}></Router>
  </ApolloProvider>
  ), document.getElementById('app')
);
