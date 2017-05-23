import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import FlatButton from 'material-ui/FlatButton';
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

class DeleteSectionButton extends React.PureComponent {
  static propTypes = {
    sectionId: PropTypes.number.isRequired,
    disabled: PropTypes.bool,

    dispatch: PropTypes.func.isRequired,
  };

  static defaultProps = {
    disabled: false,
  }

  deleteSectionHandler = () => {
    const { dispatch, sectionId } = this.props;

    const successMessage = <FormattedMessage {...translations.success} />;
    const failureMessage = <FormattedMessage {...translations.failure} />;
    const handleDelete = () => dispatch(
      deleteSurveySection(sectionId, successMessage, failureMessage)
    );
    return dispatch(showDeleteConfirmation(handleDelete));
  }

  render() {
    return (
      <FlatButton
        label={<FormattedMessage {...translations.deleteSection} />}
        onTouchTap={this.deleteSectionHandler}
        disabled={this.props.disabled}
      />
    );
  }
}

export default connect()(DeleteSectionButton);
