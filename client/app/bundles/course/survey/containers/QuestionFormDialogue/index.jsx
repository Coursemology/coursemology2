import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { getFormValues, isPristine } from 'redux-form';

import * as actionCreators from 'course/survey/actions/questions';
import { formNames } from 'course/survey/constants';
import FormDialogue from 'lib/components/FormDialogue';

import QuestionForm from './QuestionForm';

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
    base_exp: PropTypes.number,
  }).isRequired,
  formValues: PropTypes.object,
};

const QuestionFormDialogue = ({
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
    addToOptions,
    addToOptionsToDelete,
  } = bindActionCreators(actionCreators, dispatch);

  return (
    <FormDialogue
      disabled={disabled}
      hideForm={hideQuestionForm}
      open={visible}
      skipConfirmation={pristine}
      submitForm={submitQuestionForm}
      title={formTitle}
    >
      <QuestionForm
        {...{
          formValues,
          initialValues,
          onSubmit,
          disabled,
          addToOptions,
          addToOptionsToDelete,
        }}
      />
    </FormDialogue>
  );
};

QuestionFormDialogue.propTypes = propTypes;

export default connect(mapStateToProps)(QuestionFormDialogue);
