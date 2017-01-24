import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import surveys from './surveys';
import surveyForm from './surveyForm';
import notification from './notification';


export default combineReducers({
  surveys,
  surveyForm,
  notification,
  createPath: (state = '') => state,
  form: formReducer,
});
