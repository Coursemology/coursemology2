import { useState } from 'react';
import { defineMessages } from 'react-intl';
import { Button } from '@mui/material';

import CoursesNew from 'course/courses/pages/CoursesNew';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  newCourse: {
    id: 'app.common.components.newCourse',
    defaultMessage: 'New Course',
  },
});

const NewCourseButton = (): JSX.Element => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <Button onClick={(): void => setIsDialogOpen(true)} variant="outlined">
        {t(translations.newCourse)}
      </Button>
      <CoursesNew
        onClose={(): void => setIsDialogOpen(false)}
        open={isDialogOpen}
      />
    </>
  );
};

export default NewCourseButton;
