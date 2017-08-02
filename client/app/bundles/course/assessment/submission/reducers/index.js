import { combineReducers } from 'redux';
import { reducer as form } from 'redux-form';
import annotations from './annotations';
import answers from './answers';
import assessment from './assessment';
import attachments from './attachments';
import commentForms from './commentForms';
import explanations from './explanations';
import notification from './notification';
import posts from './posts';
import questions from './questions';
import questionsFlags from './questionsFlags';
import submission from './submission';
import submissionFlags from './submissionFlags';
import topics from './topics';
import grading from './grading';
import testCases from './testCases';

export default combineReducers({
  form,
  annotations,
  answers,
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
  topics,
  grading,
  testCases,
});
