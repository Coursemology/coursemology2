import { combineReducers } from 'redux';

import annotations from './annotations';
import answerFlags from './answerFlags';
import answers from './answers';
import assessment from './assessment';
import attachments from './attachments';
import codaveriFeedbackStatus from './codaveriFeedbackStatus';
import commentForms from './commentForms';
import explanations from './explanations';
import grading from './grading';
import history from './history';
import liveFeedbackChats from './liveFeedbackChats';
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

const submissionReducer = combineReducers({
  annotations,
  answers,
  answerFlags,
  attachments,
  assessment,
  codaveriFeedbackStatus,
  commentForms,
  explanations,
  liveFeedbackChats,
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

const rootReducer = (state, action) => {
  if (action.type === 'PURGE_SUBMISSION_STORE') {
    return submissionReducer(undefined, action);
  }
  return submissionReducer(state, action);
};

export default rootReducer;
