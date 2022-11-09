import { defineMessages, FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';

import { getCourseId } from 'lib/helpers/url-helpers';

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

const ExitEditModeButton = () => {
  const navigate = useNavigate();
  const courseId = getCourseId();
  return (
    <Button
      onClick={() => navigate(`/courses/${courseId}/lesson_plan`)}
      style={styles.button}
      variant="outlined"
    >
      <FormattedMessage {...translations.exitEditMode} />
    </Button>
  );
};

export default ExitEditModeButton;
