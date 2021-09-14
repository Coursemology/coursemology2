import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  injectIntl,
  defineMessages,
  intlShape,
  FormattedMessage,
} from 'react-intl';
import RaisedButton from 'material-ui/RaisedButton';
import { showEventForm, createEvent } from 'course/lesson-plan/actions';

const translations = defineMessages({
  newEvent: {
    id: 'course.lessonPlan.NewEventButton.newEvent',
    defaultMessage: 'New Event',
  },
  success: {
    id: 'course.lessonPlan.NewEventButton.success',
    defaultMessage: 'Event created.',
  },
  failure: {
    id: 'course.lessonPlan.NewEventButton.failure',
    defaultMessage: 'Failed to create event.',
  },
});

class NewEventButton extends React.Component {
  createEventHandler = (data) => {
    const { dispatch } = this.props;
    const successMessage = <FormattedMessage {...translations.success} />;
    const failureMessage = <FormattedMessage {...translations.failure} />;
    return dispatch(createEvent(data, successMessage, failureMessage));
  };

  showForm = () => {
    const { dispatch, intl } = this.props;
    return dispatch(
      showEventForm({
        onSubmit: this.createEventHandler,
        formTitle: intl.formatMessage(translations.newEvent),
        initialValues: {},
      })
    );
  };

  render() {
    if (!this.props.canManageLessonPlan) {
      return <div />;
    }

    return (
      <RaisedButton
        primary
        label={<FormattedMessage {...translations.newEvent} />}
        onClick={this.showForm}
      />
    );
  }
}

NewEventButton.propTypes = {
  canManageLessonPlan: PropTypes.bool.isRequired,

  dispatch: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

export default connect((state) => ({
  canManageLessonPlan: state.flags.canManageLessonPlan,
}))(injectIntl(NewEventButton));
