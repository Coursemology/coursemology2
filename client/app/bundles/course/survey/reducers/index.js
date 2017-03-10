import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import surveys from './surveys';
import surveyForm from './surveyForm';
import questionForm from './questionForm';
import responseForm from './responseForm';
import sectionForm from './sectionForm';
import deleteConfirmation from './deleteConfirmation';
import notification from './notification';
import canCreate from './canCreate';
import results from './results';


export default combineReducers({
  surveys,
  results,
  surveyForm,
  questionForm,
  responseForm,
  sectionForm,
  deleteConfirmation,
  notification,
  canCreate,
  form: formReducer,
});
