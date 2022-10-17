import PropTypes from 'prop-types';
import { useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actionCreators from 'course/survey/actions/sections';
import FormDialogue from 'lib/components/form/FormDialogue';
import { sectionShape } from 'course/survey/propTypes';
import SectionForm from './SectionForm';

function mapStateToProps({ sectionForm, state }) {
  return {
    ...sectionForm,
    ...state,
  };
}

const SectionFormDialogue = ({
  dispatch,
  visible,
  disabled,
  formTitle,
  initialValues,
  onSubmit,
}) => {
  const [isDirty, setIsDirty] = useState(false);
  const { hideSectionForm } = bindActionCreators(actionCreators, dispatch);

  return (
    <FormDialogue
      title={formTitle}
      open={visible}
      disabled={disabled}
      skipConfirmation={!isDirty}
      form="survey-section-form"
      hideForm={hideSectionForm}
    >
      <SectionForm
        {...{ initialValues, onSubmit, disabled }}
        emitsVia={(sectionForm) => setIsDirty(sectionForm.isDirty)}
      />
    </FormDialogue>
  );
};

SectionFormDialogue.propTypes = {
  dispatch: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
  formTitle: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  initialValues: sectionShape.isRequired,
};

export default connect(mapStateToProps)(SectionFormDialogue);
