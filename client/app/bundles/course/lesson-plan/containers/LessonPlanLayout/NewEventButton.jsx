import { Component } from 'react';
import {
  defineMessages,
  FormattedMessage,
  injectIntl,
  intlShape,
} from 'react-intl';
import { connect } from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import PropTypes from 'prop-types';

import { createEvent, showEventForm } from 'course/lesson-plan/actions';

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

class NewEventButton extends Component {
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
      }),
    );
  };

  render() {
    if (!this.props.canManageLessonPlan) {
      return <div />;
    }

    return (
      <RaisedButton
        label={<FormattedMessage {...translations.newEvent} />}
        onClick={this.showForm}
        primary={true}
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
