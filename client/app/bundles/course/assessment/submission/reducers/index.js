import { combineReducers } from 'redux';

import annotations from './annotations';
import assessment from './assessment';
import attachments from './attachments';
import commentForms from './commentForms';
import explanations from './explanations';
import form from './form';
import grading from './grading';
import history from './history';
import notification from './notification';
import posts from './posts';
import questions from './questions';
import questionsFlags from './questionsFlags';
import recorder from './recorder';
import scribing from './scribing';
import submission from './submission';
import submissionFlags from './submissionFlags';
import submissions from './submissions';
import testCases from './testCases';
import topics from './topics';

export default combineReducers({
  annotations,
  attachments,
  assessment,
  commentForms,
  explanations,
  notification,
  posts,
  questions,
  questionsFlags,
  submission,
  submissionFlags,
  recorder,
  submissions,
  scribing,
  topics,
  grading,
  testCases,
  form,
  history,
});
