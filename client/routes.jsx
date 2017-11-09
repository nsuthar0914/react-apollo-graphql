import React from 'react';
import { Route, IndexRoute, browserHistory  } from 'react-router';

import App from './App';

import Home from './containers/Home';
import Blogs from './containers/Blogs';
import Posts from './containers/Posts';
import EditPost from './containers/EditPost';

import Login from './containers/SignIn';
import SignUp from './containers/SignUp';
import Activation from './containers/Activation';

export default function () {
  function requireAuth() {
    if (!localStorage.getItem('token')) {
      browserHistory.push('/signin');
    }
  }
  return (
    <Route path="/" component={App}>
      <IndexRoute component={Home} />
      <Route path="blogs" onEnter={requireAuth}>
        <IndexRoute component={Blogs} />
        <Route path="add" component={EditPost} />
        <Route path=":blogSlug" component={Posts} />
        <Route path=":blogSlug/edit" component={EditPost} />
        <Route path=":blogSlug/verified/:email" component={Posts} />
        <Route path=":blogSlug/unverified/:email/:token" component={Posts} />
      </Route>
      <Route path="signin" component={Login}/>
      <Route path="signup" component={SignUp}/>
      <Route path="reset-password/:email/:token" component={SignUp}/>
      <Route path="activation/:email/:token" component={Activation} />
    </Route>
  )
}