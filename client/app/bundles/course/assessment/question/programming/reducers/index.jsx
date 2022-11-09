import { fromJS } from 'immutable';
import { combineReducers } from 'redux-immutable';

import programmingQuestionReducer, {
  initialState as programmingQuestionState,
} from './programmingQuestionReducer';

export const initialStates = fromJS({
  programmingQuestion: programmingQuestionState,
});

export default combineReducers({
  programmingQuestion: programmingQuestionReducer,
});
