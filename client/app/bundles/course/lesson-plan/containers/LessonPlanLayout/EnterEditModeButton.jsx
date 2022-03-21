import { defineMessages, FormattedMessage } from 'react-intl';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getCourseId } from 'lib/helpers/url-helpers';

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

const EnterEditModeButton = () => {
  const navigate = useNavigate();
  const courseId = getCourseId();
  return (
    <Button
      variant="outlined"
      onClick={() => navigate(`/courses/${courseId}/lesson_plan/edit/`)}
      style={styles.button}
    >
      <FormattedMessage {...translations.enterEditMode} />
    </Button>
  );
};

export default EnterEditModeButton;
