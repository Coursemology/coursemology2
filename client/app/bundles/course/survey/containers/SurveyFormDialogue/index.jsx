import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actionCreators from 'course/survey/actions/surveys';
import FormDialogue from 'lib/components/FormDialogue';
import SurveyForm from './SurveyForm';

function mapStateToProps({ surveyForm, ...state }) {
  return {
    ...surveyForm,
    ...state,
  };
}

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
  hasStudentResponse: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
  formTitle: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    start_at: PropTypes.instanceOf(Date),
    end_at: PropTypes.instanceOf(Date),
    base_exp: PropTypes.number,
    allow_response_after_end: PropTypes.bool,
  }).isRequired,
};

const SurveyFormDialogue = ({
  dispatch,
  visible,
  disabled,
  formTitle,
  hasStudentResponse,
  initialValues,
  onSubmit,
}) => {
  const { hideSurveyForm } = bindActionCreators(actionCreators, dispatch);

  const surveyFormProps = {
    disabled,
    disableAnonymousToggle:
      // eslint-disable-next-line react/prop-types
      initialValues && initialValues.anonymous && hasStudentResponse,
    initialValues,
    onSubmit,
  };

  return (
    <FormDialogue
      title={formTitle}
      open={visible}
      skipConfirmation={false}
      disabled={disabled}
      form="survey-form"
      hideForm={hideSurveyForm}
    >
      <SurveyForm {...surveyFormProps} />
    </FormDialogue>
  );
};

SurveyFormDialogue.propTypes = propTypes;

export default connect(mapStateToProps)(SurveyFormDialogue);
