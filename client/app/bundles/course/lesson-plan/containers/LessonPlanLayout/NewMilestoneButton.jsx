import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl';
import { Button } from '@mui/material';
import { showMilestoneForm, createMilestone } from 'course/lesson-plan/actions';

const translations = defineMessages({
  newMilestone: {
    id: 'course.lessonPlan.NewMilestoneButton.newMilestone',
    defaultMessage: 'New Milestone',
  },
  success: {
    id: 'course.lessonPlan.NewMilestoneButton.success',
    defaultMessage: 'Milestone created.',
  },
  failure: {
    id: 'course.lessonPlan.NewMilestoneButton.failure',
    defaultMessage: 'Failed to create milestone.',
  },
});

const styles = {
  button: {
    marginRight: 16,
  },
};

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
      showMilestoneForm({
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
      <Button
        variant="contained"
        color="primary"
        onClick={this.showForm}
        style={styles.button}
      >
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

export default connect((state) => ({
  canManageLessonPlan: state.flags.canManageLessonPlan,
}))(injectIntl(NewMilestoneButton));
