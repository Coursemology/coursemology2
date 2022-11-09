import { combineReducers } from 'redux';

import notificationPopup from 'lib/reducers/notificationPopup';

import duplication from './duplication';

export default combineReducers({
  notificationPopup,
  duplication,
});
