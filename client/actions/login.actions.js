import {apiCall} from '../utils.jsx';

const loginRequest = () => {
  return {
    type: "LOGIN_REQUEST"
  }
}
const loginFinished = (response) => {
  return {
    type: "LOGIN_FINISHED",
    response: response
  }
}
export const login = (payload) => {
  return dispatch => {
    dispatch(loginRequest());
    return apiCall(payload).then(response => {
      dispatch(loginFinished(JSON.parse(response)));
      return JSON.parse(response).data;
    })
  }
}

const subscribeRequest = () => {
  return {
    type: "SUBSCRIBE_REQUEST"
  }
}
const subscribeFinished = (response) => {
  return {
    type: "SUBSCRIBE_FINISHED",
    response: response
  }
}
export const subscribe = (payload) => {
  return dispatch => {
    dispatch(subscribeRequest());
    return apiCall(payload).then(response => {
      dispatch(subscribeFinished(JSON.parse(response)));
      return JSON.parse(response).data;
    })
  }
}

const getSubscriberRequest = () => {
  return {
    type: "GET_SUBSCRIBER_REQUEST"
  }
}
const getSubscriberFinished = (response) => {
  return {
    type: "GET_SUBSCRIBER_FINISHED",
    response: response
  }
}
export const getSubscriber = (payload) => {
  return dispatch => {
    dispatch(getSubscriberRequest());
    return apiCall(payload).then(response => {
      dispatch(getSubscriberFinished(JSON.parse(response)));
      return JSON.parse(response).data;
    })
  }
}

const activationRequest = () => {
  return {
    type: "ACTIVATION_REQUEST"
  }
}
const activationFinished = (response) => {
  return {
    type: "ACTIVATION_FINISHED",
    response: response
  }
}
export const activation = (payload) => {
  return dispatch => {
    dispatch(activationRequest());
    return apiCall(payload).then(response => {
      dispatch(activationFinished(JSON.parse(response)));
      return JSON.parse(response).data;
    })
  }
}

const signupRequest = () => {
  return {
    type: "SIGNUP_REQUEST"
  }
}
const signupFinished = (response) => {
  return {
    type: "SIGNUP_FINISHED",
    response: response
  }
}
export const signup = (payload) => {
  return dispatch => {
    dispatch(signupRequest());
    return apiCall(payload).then(response => {
      dispatch(signupFinished(JSON.parse(response)));
      return JSON.parse(response).data;
    })
  }
}

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  return {
    type: "LOGOUT"
  }
}