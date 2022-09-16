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

const EnterEditModeButton = () => {
  const navigate = useNavigate();
  const courseId = getCourseId();
  return (
    <Button
      className="mr-4"
      variant="outlined"
      onClick={() => navigate(`/courses/${courseId}/lesson_plan/edit/`)}
    >
      <FormattedMessage {...translations.enterEditMode} />
    </Button>
  );
};

export default EnterEditModeButton;
