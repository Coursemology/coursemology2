import { Component } from 'react';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Button } from '@mui/material';
import PropTypes from 'prop-types';

import {
  createSurveySection,
  showSectionForm,
} from 'course/survey/actions/sections';

const translations = defineMessages({
  newSection: {
    id: 'course.surveys.NewSectionButton.newSection',
    defaultMessage: 'New Section',
  },
  success: {
    id: 'course.surveys.NewSectionButton.success',
    defaultMessage: 'Section created.',
  },
  failure: {
    id: 'course.surveys.NewSectionButton.failure',
    defaultMessage: 'Failed to create question.',
  },
});

class NewSectionButton extends Component {
  createSectionHandler = (data, setError) => {
    const { dispatch } = this.props;
    const payload = { section: data };
    const successMessage = <FormattedMessage {...translations.success} />;
    const failureMessage = <FormattedMessage {...translations.failure} />;
    return dispatch(
      createSurveySection(payload, successMessage, failureMessage, setError),
    );
  };

  showNewSectionForm = () => {
    const { dispatch, intl } = this.props;
    return dispatch(
      showSectionForm({
        onSubmit: this.createSectionHandler,
        formTitle: intl.formatMessage(translations.newSection),
        initialValues: {
          title: '',
          description: '',
        },
      }),
    );
  };

  render() {
    return (
      <Button
        className="mr-4"
        color="primary"
        disabled={this.props.disabled}
        onClick={this.showNewSectionForm}
        variant="contained"
      >
        <FormattedMessage {...translations.newSection} />
      </Button>
    );
  }
}

NewSectionButton.propTypes = {
  disabled: PropTypes.bool,

  dispatch: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
};

NewSectionButton.defaultProps = {
  disabled: false,
};

export default connect()(injectIntl(NewSectionButton));
