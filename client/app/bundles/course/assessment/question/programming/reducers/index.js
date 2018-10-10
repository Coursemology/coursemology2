import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import notificationPopup from 'lib/reducers/notificationPopup';
import flagsReducer from './flags';

export default combineReducers({
  flags: flagsReducer,
  form: formReducer,
  notificationPopup,
});
