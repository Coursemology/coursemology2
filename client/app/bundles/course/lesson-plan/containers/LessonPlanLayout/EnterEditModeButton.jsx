import { defineMessages, FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';

import { getCourseId } from 'lib/helpers/url-helpers';

const translations = defineMessages({
  enterEditMode: {
    id: 'course.lessonPlan.LessonPlanLayout.EnterEditModeButton.enterEditMode',
    defaultMessage: 'Edit Mode',
  },
});

const EnterEditModeButton = () => {
  const navigate = useNavigate();
  const courseId = getCourseId();
  return (
    <Button
      onClick={() => navigate(`/courses/${courseId}/lesson_plan/edit`)}
      variant="outlined"
    >
      <FormattedMessage {...translations.enterEditMode} />
    </Button>
  );
};

export default EnterEditModeButton;
