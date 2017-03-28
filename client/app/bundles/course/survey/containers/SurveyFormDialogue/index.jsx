import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getFormValues, isPristine } from 'redux-form';
import * as actionCreators from 'course/survey/actions/surveys';
import FormDialogue from 'course/survey/components/FormDialogue';
import { formNames } from 'course/survey/constants';
import SurveyForm from './SurveyForm';

function mapStateToProps({ surveyForm, ...state }) {
  return {
    ...surveyForm,
    ...state,
    pristine: isPristine(formNames.SURVEY)(state),
    formValues: getFormValues(formNames.SURVEY)(state),
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
    hideSurveyForm,
    submitSurveyForm,
    shiftEndDate,
  } = bindActionCreators(actionCreators, dispatch);

  return (
    <FormDialogue
      title={formTitle}
      hideForm={hideSurveyForm}
      submitForm={submitSurveyForm}
      skipConfirmation={pristine}
      disabled={disabled}
      open={visible}
    >
      <SurveyForm {...{ shiftEndDate, formValues, initialValues, onSubmit, disabled }} />
    </FormDialogue>
  );
};

SurveyFormDialogue.propTypes = propTypes;

export default connect(mapStateToProps)(SurveyFormDialogue);
