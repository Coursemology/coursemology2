import { PureComponent } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import FlatButton from 'material-ui/FlatButton';
import PropTypes from 'prop-types';

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
      <FlatButton
        disabled={this.props.disabled}
        label={<FormattedMessage {...translations.deleteSection} />}
        onClick={this.deleteSectionHandler}
      />
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
