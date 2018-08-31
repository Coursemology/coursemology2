import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { formValueSelector } from 'redux-form';
import { optionShape } from 'lib/components/redux-form/MultiSelect';

import ProgrammingQuestionForm from './containers/ProgrammingQuestionForm/ProgrammingQuestionReduxForm';
import * as programmingQuestionActionCreators from './actions';
import { formNames } from './constants';

const selector = formValueSelector(formNames.PROGRAMMING_QUESTION);

function mapStateToProps(state) {
  return {
    autograded: selector(state, 'question_programming[autograded]'),
    languageId: selector(state, 'question_programming[language_id]'),
  };
}

const ProgrammingQuestion = (props) => {
  const { dispatch, formValues, ...otherProps } = props;
  const actions = bindActionCreators(programmingQuestionActionCreators, dispatch);

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
    },
  };

  return (
    <ProgrammingQuestionForm
      initialValues={initialValues}
      {...{
        actions,
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
  import_result: PropTypes.any,

  dispatch: PropTypes.func.isRequired,
};

ProgrammingQuestion.defaultProps = {
  autograded: false,
  languageId: 0,
};

export default connect(mapStateToProps)(ProgrammingQuestion);
