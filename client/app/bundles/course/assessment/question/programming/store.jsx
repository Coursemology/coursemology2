import { compose, createStore, applyMiddleware, combineReducers } from 'redux';

// See
// https://github.com/gaearon/redux-thunk and http://redux.js.org/docs/advanced/AsyncActions.html
import thunkMiddleware from 'redux-thunk';

import reducers, { initialStates } from './reducers';

export default props => {
  // This is how we get initial props Rails into redux.
  const { question, form_data } = props;
  const { $$programmingQuestionState } = initialStates;

  // Redux expects to initialize the store using an Object, not an Immutable.Map
  const initialState = {
    $$programmingQuestionStore: $$programmingQuestionState.merge({
      question, form_data,
    }),
  };

  const reducer = combineReducers(reducers);
  const composedStore = compose(
    applyMiddleware(thunkMiddleware)
  );
  const storeCreator = composedStore(createStore);
  return storeCreator(reducer, initialState);
};
