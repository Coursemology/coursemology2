import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import notificationPopup from 'lib/reducers/notificationPopup';
import objectDuplication from './objectDuplication';

export default combineReducers({
  notificationPopup,
  objectDuplication,
  form: formReducer,
});
