import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import submissionEditReducer from './submissionEditReducer';

export default combineReducers({
  submissionEdit: submissionEditReducer,
  form: formReducer,
});
