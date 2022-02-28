import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Button } from '@material-ui/core';
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

const ExitEditModeButton = ({
  match: {
    params: { courseId },
  },
}) => (
  <Button
    variant="contained"
    onClick={() => history.push(`/courses/${courseId}/lesson_plan/`)}
    style={styles.button}
  >
    <FormattedMessage {...translations.exitEditMode} />
  </Button>
);

ExitEditModeButton.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      courseId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default ExitEditModeButton;
