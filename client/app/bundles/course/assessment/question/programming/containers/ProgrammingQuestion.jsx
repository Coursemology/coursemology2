import React, { PropTypes } from 'react';
import ProgrammingQuestionForm from '../components/ProgrammingQuestionForm';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Immutable from 'immutable';
import * as programmingQuestionActionCreators from '../actions/programmingQuestionActionCreators';

function select(state) {
  // Note the use of `$$` to prefix the property name because the value is of type Immutable.js
  return { $$programmingQuestionStore: state.$$programmingQuestionStore };
}

const ProgrammingQuestion = (props) => {
  const { dispatch, $$programmingQuestionStore } = props;
  const actions = bindActionCreators(programmingQuestionActionCreators, dispatch);
  const data = {
    question: $$programmingQuestionStore.get('question'),
    formData: $$programmingQuestionStore.get('form_data')
  };

  // This uses the ES2015 spread operator to pass properties as it is more DRY
  return (
    <ProgrammingQuestionForm {...{ actions, data }} />
  );
};

ProgrammingQuestion.propTypes = {
  dispatch: PropTypes.func.isRequired,

  // This corresponds to the value used in function select above.
  // We prefix all property and variable names pointing to Immutable.js objects with '$$'.
  // This allows us to immediately know we don't call $$programmingQuestionStore['someProperty'],
  // but instead use the Immutable.js `get` API for Immutable.Map
  $$programmingQuestionStore: PropTypes.instanceOf(Immutable.Map).isRequired,
};

// Don't forget to actually use connect!
// Note that we don't export ProgrammingQuestion, but the redux "connected" version of it.
// See https://github.com/reactjs/react-redux/blob/master/docs/api.md#examples
export default connect(select)(ProgrammingQuestion);
