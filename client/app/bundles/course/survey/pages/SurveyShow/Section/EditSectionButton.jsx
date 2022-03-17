import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  injectIntl,
  defineMessages,
  intlShape,
  FormattedMessage,
} from 'react-intl';
import { Button } from '@material-ui/core';

import {
  showSectionForm,
  updateSurveySection,
} from 'course/survey/actions/sections';
import { sectionShape } from 'course/survey/propTypes';

const translations = defineMessages({
  editSection: {
    id: 'course.surveys.EditSectionButton.editSection',
    defaultMessage: 'Edit Section',
  },
  success: {
    id: 'course.surveys.EditSectionButton.success',
    defaultMessage: 'Section updated.',
  },
  failure: {
    id: 'course.surveys.EditSectionButton.failure',
    defaultMessage: 'Failed to update question.',
  },
});

class EditSectionButton extends Component {
  showEditSectionForm = () => {
    const {
      dispatch,
      intl,
      section: { title, description },
    } = this.props;
    return dispatch(
      showSectionForm({
        onSubmit: this.updateSectionHandler,
        formTitle: intl.formatMessage(translations.editSection),
        initialValues: { title, description },
      }),
    );
  };

  updateSectionHandler = (data) => {
    const { dispatch, section } = this.props;
    const payload = { section: data };
    const successMessage = <FormattedMessage {...translations.success} />;
    const failureMessage = <FormattedMessage {...translations.failure} />;
    return dispatch(
      updateSurveySection(section.id, payload, successMessage, failureMessage),
    );
  };

  render() {
    return (
      <Button disabled={this.props.disabled} onClick={this.showEditSectionForm}>
        <FormattedMessage {...translations.editSection} />
      </Button>
    );
  }
}

EditSectionButton.propTypes = {
  section: sectionShape,
  disabled: PropTypes.bool,

  dispatch: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

EditSectionButton.defaultProps = {
  disabled: false,
};

export default connect()(injectIntl(EditSectionButton));
