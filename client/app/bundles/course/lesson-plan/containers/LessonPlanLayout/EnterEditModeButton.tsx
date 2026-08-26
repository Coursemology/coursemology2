import { defineMessages } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';

import { getCourseId } from 'lib/helpers/url-helpers';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  enterEditMode: {
    id: 'course.lessonPlan.LessonPlanLayout.EnterEditModeButton.enterEditMode',
    defaultMessage: 'Edit Mode',
  },
});

const EnterEditModeButton = (): JSX.Element => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const courseId = getCourseId();

  return (
    <Button
      onClick={(): void => navigate(`/courses/${courseId}/lesson_plan/edit`)}
      variant="outlined"
    >
      {t(translations.enterEditMode)}
    </Button>
  );
};

export default EnterEditModeButton;
