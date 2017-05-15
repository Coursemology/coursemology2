import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import scribingQuestionReducer, { initialState as scribingQuestionState } from './scribingQuestionReducer';

export const initialStates = {
  scribingQuestion: scribingQuestionState,
};

export default combineReducers({
  scribingQuestion: scribingQuestionReducer,
  form: formReducer,
});
