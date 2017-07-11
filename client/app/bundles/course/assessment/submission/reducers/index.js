import { combineReducers } from 'redux';
import { reducer as form } from 'redux-form';
import submissionEdit from './submissionEdit';
import annotations from './annotations';
import answers from './answers';
import assessment from './assessment';
import attachments from './attachments';
import commentForms from './commentForms';
import explanations from './explanations';
import posts from './posts';
import questionsFlags from './questionsFlags';
import questions from './questions';
import submission from './submission';
import topics from './topics';
import grading from './grading';
import testCases from './testCases';

export default combineReducers({
  submissionEdit,
  form,
  annotations,
  answers,
  attachments,
  assessment,
  commentForms,
  explanations,
  posts,
  questionsFlags,
  questions,
  submission,
  topics,
  grading,
  testCases,
});
