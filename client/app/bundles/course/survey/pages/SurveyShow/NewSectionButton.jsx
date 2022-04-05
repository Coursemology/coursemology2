import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  injectIntl,
  defineMessages,
  intlShape,
  FormattedMessage,
} from 'react-intl';
import { Button } from '@mui/material';

import {
  showSectionForm,
  createSurveySection,
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

const styles = {
  button: {
    marginRight: 15,
  },
};

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
        variant="contained"
        color="primary"
        disabled={this.props.disabled}
        onClick={this.showNewSectionForm}
        style={styles.button}
      >
        <FormattedMessage {...translations.newSection} />{' '}
      </Button>
    );
  }
}

NewSectionButton.propTypes = {
  disabled: PropTypes.bool,

  dispatch: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

NewSectionButton.defaultProps = {
  disabled: false,
};

export default connect()(injectIntl(NewSectionButton));
