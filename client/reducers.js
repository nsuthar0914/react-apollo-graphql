import { combineReducers } from 'redux';
import login from './reducers/login.reducers.js';

const reducers = combineReducers({
  login,
});

export default reducers;
