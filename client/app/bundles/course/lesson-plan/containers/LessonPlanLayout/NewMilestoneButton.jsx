import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape, FormattedMessage } from 'react-intl';
import RaisedButton from 'material-ui/RaisedButton';
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

class NewMilestoneButton extends React.Component {
  static propTypes = {
    canManageLessonPlan: PropTypes.bool.isRequired,

    dispatch: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
  }

  static defaultProps = {
    disabled: false,
  }

  createMilestoneHandler = (data) => {
    const { dispatch } = this.props;
    const successMessage = <FormattedMessage {...translations.success} />;
    const failureMessage = <FormattedMessage {...translations.failure} />;
    return dispatch(createMilestone(data, successMessage, failureMessage));
  }

  showForm = () => {
    const { dispatch, intl } = this.props;
    return dispatch(showMilestoneForm({
      onSubmit: this.createMilestoneHandler,
      formTitle: intl.formatMessage(translations.newMilestone),
    }));
  }

  render() {
    if (!this.props.canManageLessonPlan) { return <div />; }

    return (
      <RaisedButton
        primary
        label={<FormattedMessage {...translations.newMilestone} />}
        onTouchTap={this.showForm}
        style={styles.button}
      />
    );
  }
}

export default connect(state => ({
  canManageLessonPlan: state.flags.canManageLessonPlan,
}))(injectIntl(NewMilestoneButton));
