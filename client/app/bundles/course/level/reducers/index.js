import { combineReducers } from 'redux';
import notificationPopup from 'lib/reducers/notificationPopup';
import levelEdit from './level';

export default combineReducers({
  notificationPopup,
  levelEdit,
});
