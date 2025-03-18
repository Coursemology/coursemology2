import { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';

import * as actionCreators from 'course/survey/actions/questions';
import FormDialogue from 'lib/components/form/FormDialogue';

import QuestionForm from './QuestionForm';

function mapStateToProps({ surveys: { questionForm } }) {
  return { ...questionForm };
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
  const [isDirty, setIsDirty] = useState(false);
  const { hideQuestionForm } = bindActionCreators(actionCreators, dispatch);

  return (
    <FormDialogue
      disabled={disabled}
      form="survey-section-question-form"
      hideForm={hideQuestionForm}
      open={visible}
      skipConfirmation={!isDirty}
      title={formTitle}
    >
      <QuestionForm
        {...{
          disabled,
          initialValues,
          onSubmit,
        }}
        onDirtyChange={setIsDirty}
      />
    </FormDialogue>
  );
};

QuestionFormDialogue.propTypes = propTypes;

export default connect(mapStateToProps)(QuestionFormDialogue);
