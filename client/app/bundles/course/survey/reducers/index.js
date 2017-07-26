import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import notificationPopup from 'lib/reducers/notificationPopup';
import deleteConfirmation from 'lib/reducers/deleteConfirmation';
import surveys from './surveys';
import surveyForm from './surveyForm';
import questionForm from './questionForm';
import responseForm from './responseForm';
import sectionForm from './sectionForm';
import surveysFlags from './surveysFlags';
import results from './results';
import responses from './responses';


export default combineReducers({
  notificationPopup,
  deleteConfirmation,
  surveys,
  responses,
  results,
  surveyForm,
  questionForm,
  responseForm,
  sectionForm,
  surveysFlags,
  form: formReducer,
});
