import programmingQuestionReducer from './programmingQuestionReducer';
import { $$initialState as $$programmingQuestionState } from './programmingQuestionReducer';

export default {
  $$programmingQuestionStore: programmingQuestionReducer,
};

export const initialStates = {
  $$programmingQuestionState,
};
