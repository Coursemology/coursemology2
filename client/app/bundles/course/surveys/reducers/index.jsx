import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import surveys from './surveys';
import surveyForm from './surveyForm';
import notification from './notification';
import canCreate from './canCreate';


export default combineReducers({
  surveys,
  surveyForm,
  notification,
  canCreate,
  form: formReducer,
});
