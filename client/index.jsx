import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, browserHistory } from 'react-router';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import reduxThunk from 'redux-thunk';
import createLogger from 'redux-logger';

import {
  ApolloClient,
  ApolloProvider,
  createNetworkInterface,
  toIdValue,
} from 'react-apollo';

import routes from './routes.jsx';
import reducers from './reducers.js';

const networkInterface = createNetworkInterface({ uri: 'http://localhost:3000/graphql' });
networkInterface.use([{
  applyMiddleware(req, next) {
    if (!req.options.headers) {
      req.options.headers = {}; // Create the header object if needed.
    }
    let token = localStorage.getItem('token')
    req.options.headers['Authorization'] = token ? `Bearer ${token}` : null;
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

let middleware = [reduxThunk];

const logger = createLogger({collapsed: true});
if (__DEVELOPMENT__) {
  middleware = [...middleware, logger];
}

let createStoreWithMiddleware = applyMiddleware(...middleware)(createStore);
let store = createStoreWithMiddleware(reducers);



ReactDOM.render((
  <ApolloProvider client={client}>
    <Provider store={store}>
      <Router history={browserHistory} routes={routes(store)}></Router>
    </Provider>
  </ApolloProvider>
  ), document.getElementById('app')
);
