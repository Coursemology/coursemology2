import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import RaisedButton from 'material-ui/RaisedButton';

const translations = defineMessages({
  newEvent: {
    id: 'course.lessonPlan.NewEventButton.newEvent',
    defaultMessage: 'New Event',
  },
});

const NewEventButton = ({ match: { params: { courseId } } }) => (
  <RaisedButton
    label={<FormattedMessage {...translations.newEvent} />}
    href={`/courses/${courseId}/lesson_plan/events/new`}
    primary
  />
);

NewEventButton.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      courseId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default NewEventButton;
