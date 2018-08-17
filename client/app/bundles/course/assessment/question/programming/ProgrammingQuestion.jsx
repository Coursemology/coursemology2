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
  const languageId = selector(state, 'question_programming[language_id]');

  return { autograded, languageId };
}

const ProgrammingQuestion = (props) => {
  const { dispatch, formValues, test_ui, ...otherProps } = props;
  const actions = bindActionCreators(programmingQuestionActionCreators, dispatch);
  const onlineEditorActions = bindActionCreators(onlineEditorActionCreators, dispatch);

  const initialValues = {
    question_programming: {
      submission: '',
      solution: '',
      submit_as_file: false,
      submission_files: [],
      solution_files: [],
      prepend: '',
      append: '',
      data_files: [],
      test_cases: {
        public: [],
        private: [],
        evaluation: [],
      },
      ...formValues,
      ...test_ui,
    },
  };

  return (
    <ProgrammingQuestionForm
      initialValues={initialValues}
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
  languageId: PropTypes.number,

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
  languageId: 0,
};

export default connect(mapStateToProps)(ProgrammingQuestion);
