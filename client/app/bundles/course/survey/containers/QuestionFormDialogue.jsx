import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getFormValues, isPristine } from 'redux-form';
import { formNames } from '../constants';
import * as actionCreators from '../actions';
import FormDialogue from '../components/FormDialogue';
import QuestionForm from '../components/QuestionForm';

function mapStateToProps({ questionForm, ...state }) {
  return {
    ...questionForm,
    ...state,
    pristine: isPristine(formNames.SURVEY_QUESTION)(state),
    formValues: getFormValues(formNames.SURVEY_QUESTION)(state),
  };
}

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
  pristine: PropTypes.bool.isRequired,
  formTitle: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    start_at: PropTypes.instanceOf(Date),
    end_at: PropTypes.instanceOf(Date),
    base_exp: React.PropTypes.number,
  }).isRequired,
  formValues: PropTypes.object,
};

const SurveyFormDialogue = ({
  dispatch,
  visible,
  disabled,
  pristine,
  formValues,
  formTitle,
  initialValues,
  onSubmit,
}) => {
  const {
    hideQuestionForm,
    submitQuestionForm,
    shiftEndDate,
  } = bindActionCreators(actionCreators, dispatch);

  return (
    <FormDialogue
      title={formTitle}
      hideForm={hideQuestionForm}
      submitForm={submitQuestionForm}
      skipConfirmation={pristine}
      disabled={disabled}
      open={visible}
    >
      <QuestionForm {...{ shiftEndDate, formValues, initialValues, onSubmit, disabled }} />
    </FormDialogue>
  );
};

SurveyFormDialogue.propTypes = propTypes;

export default connect(mapStateToProps)(SurveyFormDialogue);
