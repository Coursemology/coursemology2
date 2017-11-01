import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import notificationPopup from 'lib/reducers/notificationPopup';
import levelEdit from './level';

export default combineReducers({
  notificationPopup,
  levelEdit,
  form: formReducer,
});
