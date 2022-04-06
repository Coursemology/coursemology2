import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actionCreators from 'course/survey/actions/questions';
import FormDialogue from 'lib/components/FormDialogue';
import QuestionForm from './QuestionForm';

function mapStateToProps({ questionForm, ...state }) {
  return {
    ...questionForm,
    ...state,
  };
}

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
  formTitle: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    start_at: PropTypes.instanceOf(Date),
    end_at: PropTypes.instanceOf(Date),
    base_exp: PropTypes.number,
  }).isRequired,
};

const QuestionFormDialogue = ({
  dispatch,
  visible,
  disabled,
  formTitle,
  initialValues,
  onSubmit,
}) => {
  const { hideQuestionForm } = bindActionCreators(actionCreators, dispatch);

  return (
    <FormDialogue
      title={formTitle}
      open={visible}
      skipConfirmation={false}
      disabled={disabled}
      form="survey-section-question-form"
      hideForm={hideQuestionForm}
    >
      <QuestionForm
        {...{
          disabled,
          initialValues,
          onSubmit,
        }}
      />
    </FormDialogue>
  );
};

QuestionFormDialogue.propTypes = propTypes;

export default connect(mapStateToProps)(QuestionFormDialogue);
