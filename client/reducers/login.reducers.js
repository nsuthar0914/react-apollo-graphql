import Immutable from "immutable";

const immutableState = Immutable.Map({
  fetching: false,
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : {},
  error: null
})

const login = (state = immutableState, action) => {
  switch (action.type) {
    case "LOGIN_REQUEST":
      return state.set("fetching", true)
        .set("error", null);
    case "LOGIN_FINISHED":
      if (action.response.data.login && action.response.data.login.viewer) {
        action.response.data.login.viewer.token && localStorage.setItem('token', action.response.data.login.viewer.token);
        localStorage.setItem('user', JSON.stringify(action.response.data.login.viewer));
        return state.set("fetching", false)
          .set("user", action.response.data.login.viewer);
      } else {
        return state.set("fetching", false)
          .set("error", "Invalid Credentials");
      }
    case "SIGNUP_REQUEST":
      return state.set("fetching", true)
        .set("error", null);
    case "SIGNUP_FINISHED":
      if (action.response.data.signup && action.response.data.signup.viewer) {
        // action.response.data.signup.viewer.token && localStorage.setItem('token', action.response.data.signup.viewer.token);
        // localStorage.setItem('user', JSON.stringify(action.response.data.signup.viewer));
        return state.set("fetching", false)
          .set("user", action.response.data.signup.viewer);
      } else {
        return state.set("fetching", false)
          .set("error", "Could not sign up with these credentials");
      }
    case "LOGOUT":
      return state.set("user", Immutable.Map({}))
    default:
      return state
  }
}

export default login;