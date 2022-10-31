import { combineReducers } from 'redux';
import answers from './answers';
import annotations from './annotations';
import assessment from './assessment';
import attachments from './attachments';
import codaveriFeedbackStatus from './codaveriFeedbackStatus';
import commentForms from './commentForms';
import explanations from './explanations';
import notification from './notification';
import recorder from './recorder';
import posts from './posts';
import questions from './questions';
import questionsFlags from './questionsFlags';
import submission from './submission';
import submissionFlags from './submissionFlags';
import submissions from './submissions';
import scribing from './scribing';
import topics from './topics';
import grading from './grading';
import testCases from './testCases';
import history from './history';

export default combineReducers({
  annotations,
  answers,
  attachments,
  assessment,
  codaveriFeedbackStatus,
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
  history,
});
