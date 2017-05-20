import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import submissionEditReducer from './submissionEditReducer';
import answers from './answers';
import explanations from './explanations';
import posts from './posts';
import questions from './questions';
import topics from './topics';

export default combineReducers({
  submissionEdit: submissionEditReducer,
  form: formReducer,
  answers,
  explanations,
  posts,
  questions,
  topics,
});
