import Immutable from 'immutable';
import { combineReducers } from 'redux-immutable';
import programmingQuestionReducer, {
  initialState as programmingQuestionState,
} from './programmingQuestionReducer';

export const initialStates = Immutable.fromJS({
  programmingQuestion: programmingQuestionState,
});

export default combineReducers({
  programmingQuestion: programmingQuestionReducer,
});
