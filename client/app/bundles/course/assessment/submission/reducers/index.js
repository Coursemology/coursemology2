import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import submissionEditReducer from './submissionEditReducer';
import answers from './answers';
import commentForms from './commentForms';
import explanations from './explanations';
import posts from './posts';
import questions from './questions';
import topics from './topics';

export default combineReducers({
  submissionEdit: submissionEditReducer,
  form: formReducer,
  answers,
  commentForms,
  explanations,
  posts,
  questions,
  topics,
});
