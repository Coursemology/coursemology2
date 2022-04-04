import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import formDialog from './formDialog';
import editPage from './editPage';
import statisticsPage from './statisticsPage';

export default combineReducers({
  formDialog,
  editPage,
  statisticsPage,
  form: formReducer,
});
