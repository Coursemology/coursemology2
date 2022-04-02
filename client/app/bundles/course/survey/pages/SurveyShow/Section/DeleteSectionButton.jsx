import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Button } from '@mui/material';

import { showDeleteConfirmation } from 'course/survey/actions';
import { deleteSurveySection } from 'course/survey/actions/sections';

const translations = defineMessages({
  deleteSection: {
    id: 'course.surveys.DeleteSectionButton.deleteSection',
    defaultMessage: 'Delete Section',
  },
  success: {
    id: 'course.surveys.DeleteSectionButton.success',
    defaultMessage: 'Section deleted.',
  },
  failure: {
    id: 'course.surveys.DeleteSectionButton.failure',
    defaultMessage: 'Failed to delete section.',
  },
});

class DeleteSectionButton extends PureComponent {
  deleteSectionHandler = () => {
    const { dispatch, sectionId } = this.props;

    const successMessage = <FormattedMessage {...translations.success} />;
    const failureMessage = <FormattedMessage {...translations.failure} />;
    const handleDelete = () =>
      dispatch(deleteSurveySection(sectionId, successMessage, failureMessage));
    return dispatch(showDeleteConfirmation(handleDelete));
  };

  render() {
    return (
      <Button
        color="secondary"
        disabled={this.props.disabled}
        onClick={this.deleteSectionHandler}
      >
        <FormattedMessage {...translations.deleteSection} />
      </Button>
    );
  }
}

DeleteSectionButton.propTypes = {
  sectionId: PropTypes.number.isRequired,
  disabled: PropTypes.bool,

  dispatch: PropTypes.func.isRequired,
};

DeleteSectionButton.defaultProps = {
  disabled: false,
};

export default connect()(DeleteSectionButton);
