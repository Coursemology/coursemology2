import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Immutable from 'immutable';

import ProgrammingQuestionForm from '../components/ProgrammingQuestionForm';
import * as onlineEditorActionCreators from '../actions/onlineEditorActionCreators';
import * as programmingQuestionActionCreators from '../actions/programmingQuestionActionCreators';
import * as templatePackageActionCreators from '../actions/templatePackageActionCreators';


function mapStateToProps(state) {
  return state.toObject();
}

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  programmingQuestion: PropTypes.instanceOf(Immutable.Map).isRequired,
};

const ProgrammingQuestion = (props) => {
  const { dispatch, programmingQuestion } = props;
  const actions = bindActionCreators(programmingQuestionActionCreators, dispatch);
  const templatePackageActions = bindActionCreators(templatePackageActionCreators, dispatch);
  const onlineEditorActions = bindActionCreators(onlineEditorActionCreators, dispatch);

  return (
    <ProgrammingQuestionForm
      {...{
        actions,
        data: programmingQuestion,
        onlineEditorActions,
        templatePackageActions,
      }}
    />
  );
};

ProgrammingQuestion.propTypes = propTypes;

export default connect(mapStateToProps)(ProgrammingQuestion);
