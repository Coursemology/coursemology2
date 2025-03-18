import { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';

import * as actionCreators from 'course/survey/actions/sections';
import { sectionShape } from 'course/survey/propTypes';
import FormDialogue from 'lib/components/form/FormDialogue';

import SectionForm from './SectionForm';

function mapStateToProps({ surveys: { sectionForm } }) {
  return { ...sectionForm };
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
      disabled={disabled}
      form="survey-section-form"
      hideForm={hideSectionForm}
      open={visible}
      skipConfirmation={!isDirty}
      title={formTitle}
    >
      <SectionForm
        {...{ initialValues, onSubmit, disabled }}
        onDirtyChange={setIsDirty}
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
