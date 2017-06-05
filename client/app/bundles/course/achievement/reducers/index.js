import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import editPage from './editPage';
import formDialog from './formDialog';

export default combineReducers({
  formDialog,
  editPage,
  form: formReducer,
});
