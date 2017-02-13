import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import formDialog from './formDialog';
import editPage from './editPage';

export default combineReducers({
  formDialog,
  editPage,
  form: formReducer,
});
