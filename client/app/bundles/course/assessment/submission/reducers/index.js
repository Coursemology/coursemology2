import { combineReducers } from 'redux';
import { reducer as form } from 'redux-form';
import submissionEdit from './submissionEdit';
import annotations from './annotations';
import answers from './answers';
import commentForms from './commentForms';
import explanations from './explanations';
import posts from './posts';
import questions from './questions';
import topics from './topics';
import grading from './grading';
import testCases from './testCases';

export default combineReducers({
  submissionEdit,
  form,
  annotations,
  answers,
  commentForms,
  explanations,
  posts,
  questions,
  topics,
  grading,
  testCases,
});
