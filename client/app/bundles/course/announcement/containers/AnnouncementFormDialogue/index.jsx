import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getFormValues, isPristine } from 'redux-form';
import * as actionCreators from 'course/announcement/actions/announcements';
import FormDialogue from 'lib/components/FormDialogue';
import { formNames } from 'course/announcement/constants';
import AnnouncementForm from './AnnouncementForm';

function mapStateToProps({ announcementForm, ...state }) {
  return {
    ...announcementForm,
    ...state,
    pristine: isPristine(formNames.ANNOUNCEMENT)(state),
    formValues: getFormValues(formNames.ANNOUNCEMENT)(state),
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
    content: PropTypes.string,
    sticky: PropTypes.bool,
    start_at: PropTypes.string,
    end_at: PropTypes.string,
  }).isRequired,
};

const AnnouncementFormDialogue = ({
  dispatch,
  visible,
  disabled,
  pristine,
  formTitle,
  initialValues,
  onSubmit,
}) => {
  const { hideAnnouncementForm, submitAnnouncementForm } = bindActionCreators(actionCreators, dispatch);

  const announcementFormProps = {
    initialValues,
    onSubmit,
    disabled,
  };

  return (
    <FormDialogue
      title={formTitle}
      hideForm={hideAnnouncementForm}
      submitForm={submitAnnouncementForm}
      skipConfirmation={pristine}
      disabled={disabled}
      open={visible}
    >
      <AnnouncementForm {...announcementFormProps} />
    </FormDialogue>
  );
};

AnnouncementFormDialogue.propTypes = propTypes;

export default connect(mapStateToProps)(AnnouncementFormDialogue);
