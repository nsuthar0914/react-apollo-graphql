import {apiCall} from '../utils.jsx';

const addFileRequest = () => {
  return {
    type: "ADD_FILE_REQUEST"
  }
}
const addFileFinished = (response) => {
  return {
    type: "ADD_FILE_FINISHED",
    response: response
  }
}
export const addFile = (file) => {
  return dispatch => {
    dispatch(addFileRequest());
    return apiCall(null, file, true).then(response => {
      console.log(response);
      dispatch(addFileFinished(JSON.parse(response)));
      return JSON.parse(response).data;
    })
  }
}