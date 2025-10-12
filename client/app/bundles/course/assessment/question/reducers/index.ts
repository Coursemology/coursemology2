import { combineReducers } from 'redux';

import questionRubricsReducer from './rubrics';

export default combineReducers({
  rubrics: questionRubricsReducer,
});
