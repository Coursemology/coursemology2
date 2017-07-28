import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import RaisedButton from 'material-ui/RaisedButton';
import history from 'lib/history';

const translations = defineMessages({
  exitEditMode: {
    id: 'course.lessonPlan.ExitEditModeButton.exitEditMode',
    defaultMessage: 'Exit Edit Mode',
  },
});

const styles = {
  button: {
    marginRight: 16,
  },
};

const ExitEditModeButton = ({ match: { params: { courseId } } }) => (
  <RaisedButton
    label={<FormattedMessage {...translations.exitEditMode} />}
    onTouchTap={() => history.push(`/courses/${courseId}/lesson_plan/`)}
    style={styles.button}
  />
  );

ExitEditModeButton.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      courseId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default ExitEditModeButton;
