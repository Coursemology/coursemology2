import { Component } from 'react';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Add } from '@mui/icons-material';
import { Button } from '@mui/material';
import PropTypes from 'prop-types';

import { createMilestone } from '../../operations';
import { actions } from '../../store';

const translations = defineMessages({
  newMilestone: {
    id: 'course.lessonPlan.LessonPlanLayout.NewMilestoneButton.newMilestone',
    defaultMessage: 'Milestone',
  },
  success: {
    id: 'course.lessonPlan.LessonPlanLayout.NewMilestoneButton.success',
    defaultMessage: 'Milestone created.',
  },
  failure: {
    id: 'course.lessonPlan.LessonPlanLayout.NewMilestoneButton.failure',
    defaultMessage: 'Failed to create milestone.',
  },
});

class NewMilestoneButton extends Component {
  createMilestoneHandler = (data, setError) => {
    const { dispatch } = this.props;
    const successMessage = <FormattedMessage {...translations.success} />;
    const failureMessage = <FormattedMessage {...translations.failure} />;
    return dispatch(
      createMilestone(data, successMessage, failureMessage, setError),
    );
  };

  showForm = () => {
    const { dispatch, intl } = this.props;
    return dispatch(
      actions.showMilestoneForm({
        onSubmit: this.createMilestoneHandler,
        formTitle: intl.formatMessage(translations.newMilestone),
        initialValues: { title: '', description: '', start_at: null },
      }),
    );
  };

  render() {
    if (!this.props.canManageLessonPlan) {
      return <div />;
    }

    return (
      <Button onClick={this.showForm} startIcon={<Add />} variant="contained">
        <FormattedMessage {...translations.newMilestone} />
      </Button>
    );
  }
}

NewMilestoneButton.propTypes = {
  canManageLessonPlan: PropTypes.bool.isRequired,

  dispatch: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
};

export default connect(({ lessonPlan }) => ({
  canManageLessonPlan: lessonPlan.flags.canManageLessonPlan,
}))(injectIntl(NewMilestoneButton));
