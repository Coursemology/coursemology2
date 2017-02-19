import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import surveys from './surveys';
import surveyForm from './surveyForm';
import questionForm from './questionForm';
import responseForm from './responseForm';
import deleteConfirmation from './deleteConfirmation';
import notification from './notification';
import canCreate from './canCreate';


export default combineReducers({
  surveys,
  surveyForm,
  questionForm,
  responseForm,
  deleteConfirmation,
  notification,
  canCreate,
  form: formReducer,
});
