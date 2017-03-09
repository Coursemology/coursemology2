import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { isPristine } from 'redux-form';
import * as actionCreators from '../../actions/sections';
import FormDialogue from '../../components/FormDialogue';
import { formNames } from '../../constants';
import SectionForm from './SectionForm';
import { sectionShape } from '../../propTypes';

function mapStateToProps({ sectionForm, ...state }) {
  return {
    ...sectionForm,
    pristine: isPristine(formNames.SURVEY_SECTION)(state),
  };
}

const SectionFormDialogue = ({
  dispatch,
  visible,
  disabled,
  pristine,
  formTitle,
  initialValues,
  onSubmit,
}) => {
  const {
    hideSectionForm,
    submitSectionForm,
  } = bindActionCreators(actionCreators, dispatch);

  return (
    <FormDialogue
      title={formTitle}
      submitForm={submitSectionForm}
      skipConfirmation={pristine}
      hideForm={hideSectionForm}
      disabled={disabled}
      open={visible}
    >
      <SectionForm {...{ initialValues, onSubmit, disabled }} />
    </FormDialogue>
  );
};

SectionFormDialogue.propTypes = {
  dispatch: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
  pristine: PropTypes.bool.isRequired,
  formTitle: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  initialValues: sectionShape.isRequired,
};

export default connect(mapStateToProps)(SectionFormDialogue);
