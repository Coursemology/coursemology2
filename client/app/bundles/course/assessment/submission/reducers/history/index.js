import { combineReducers } from 'redux';
import answers from './answers';
import questions from './questions';
import testCases from './testCases';

export default combineReducers({
  answers,
  questions,
  testCases,
});
