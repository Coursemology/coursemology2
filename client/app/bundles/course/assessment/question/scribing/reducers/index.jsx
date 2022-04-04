import { combineReducers } from 'redux';
import notificationPopup from 'lib/reducers/notificationPopup';
import scribingQuestionReducer, {
  initialState as scribingQuestionState,
} from './scribingQuestionReducer';

export const initialStates = {
  scribingQuestion: scribingQuestionState,
};

export default combineReducers({
  notificationPopup,
  scribingQuestion: scribingQuestionReducer,
});
