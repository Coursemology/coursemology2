import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import formDialog from './formDialog';

export default combineReducers({
  formDialog,
  form: formReducer,
});
