import { combineReducers } from 'redux';

import deleteConfirmation from 'lib/reducers/deleteConfirmation';
import notificationPopup from 'lib/reducers/notificationPopup';

import questionForm from './questionForm';
import responseForm from './responseForm';
import responses from './responses';
import results from './results';
import sectionForm from './sectionForm';
import surveyForm from './surveyForm';
import surveys from './surveys';
import surveysFlags from './surveysFlags';

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
});
