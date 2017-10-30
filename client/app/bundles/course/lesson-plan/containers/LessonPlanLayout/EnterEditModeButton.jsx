import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import RaisedButton from 'material-ui/RaisedButton';
import history from 'lib/history';

const translations = defineMessages({
  enterEditMode: {
    id: 'course.lessonPlan.EnterEditModeButton.enterEditMode',
    defaultMessage: 'Enter Edit Mode',
  },
});

const styles = {
  button: {
    marginRight: 16,
  },
};

const EnterEditModeButton = ({ match: { params: { courseId } } }) => (
  <RaisedButton
    label={<FormattedMessage {...translations.enterEditMode} />}
    onClick={() => history.push(`/courses/${courseId}/lesson_plan/edit/`)}
    style={styles.button}
  />
  );

EnterEditModeButton.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      courseId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default EnterEditModeButton;
