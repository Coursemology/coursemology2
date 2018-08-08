import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { formValueSelector } from 'redux-form';
import { optionShape } from 'lib/components/redux-form/MultiSelect';

import ProgrammingQuestionForm from './containers/ProgrammingQuestionForm/ProgrammingQuestionReduxForm';
import * as onlineEditorActionCreators from './actions/onlineEditorActionCreators';
import * as programmingQuestionActionCreators from './actions/programmingQuestionActionCreators';
import { formNames } from './constants';

const selector = formValueSelector(formNames.PROGRAMMING_QUESTION);

function mapStateToProps(state) {
  const autograded = selector(state, 'question_programming[autograded]');
  return {
    autograded,
  };
}

const ProgrammingQuestion = (props) => {
  const { dispatch, formValues, ...otherProps } = props;
  const actions = bindActionCreators(programmingQuestionActionCreators, dispatch);
  const onlineEditorActions = bindActionCreators(onlineEditorActionCreators, dispatch);

  return (
    <ProgrammingQuestionForm
      initialValues={formValues}
      {...{
        actions,
        onlineEditorActions,
        ...otherProps,
      }}
    />
  );
};

ProgrammingQuestion.propTypes = {
  formValues: PropTypes.any,
  languages: PropTypes.arrayOf(PropTypes.any),
  skills: PropTypes.arrayOf(optionShape),

  autograded: PropTypes.bool,
  autogradedAssessment: PropTypes.bool.isRequired,
  canEditOnline: PropTypes.bool.isRequired,
  canSwitchPackageType: PropTypes.bool.isRequired,
  displayAutogradedToggle: PropTypes.bool.isRequired,
  hasAutoGradings: PropTypes.bool.isRequired,
  hasSubmissions: PropTypes.bool.isRequired,

  packageFile: PropTypes.any,
  programmingPackage: PropTypes.any,
  test_ui: PropTypes.any,
  import_result: PropTypes.any,

  dispatch: PropTypes.func.isRequired,
};

ProgrammingQuestion.defaultProps = {
  autograded: false,
};

export default connect(mapStateToProps)(ProgrammingQuestion);
