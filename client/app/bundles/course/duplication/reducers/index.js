import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import notificationPopup from 'lib/reducers/notificationPopup';
import duplication from './duplication';

export default combineReducers({
  notificationPopup,
  duplication,
  form: formReducer,
});
