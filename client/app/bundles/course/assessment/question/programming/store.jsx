import { compose, createStore, applyMiddleware, combineReducers } from 'redux';

// See
// https://github.com/gaearon/redux-thunk and http://redux.js.org/docs/advanced/AsyncActions.html
import thunkMiddleware from 'redux-thunk';

import reducers, { initialStates } from './reducers';

export default (props) => {
  const { question, package_ui, test_ui, form_data, import_result } = props;
  const { programmingQuestionState } = initialStates;

  const initialState = {
    programmingQuestionStore: programmingQuestionState.mergeDeep({
      question, package_ui, test_ui, form_data, import_result,
    }),
  };

  const reducer = combineReducers(reducers);
  const composedStore = compose(
    applyMiddleware(thunkMiddleware)
  );
  const storeCreator = composedStore(createStore);
  return storeCreator(reducer, initialState);
};
