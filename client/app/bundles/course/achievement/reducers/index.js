import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import editPage from './editPage';
import indexFormDialog from './indexFormDialog';

export default combineReducers({
  indexFormDialog,
  editPage,
  form: formReducer,
});
