import { useState } from 'react';
import { defineMessages } from 'react-intl';
import { Button, useMediaQuery } from '@mui/material';

import CoursesNew from 'course/courses/pages/CoursesNew';
import useTranslation from 'lib/hooks/useTranslation';
import AddButton from 'lib/components/core/buttons/AddButton';

const translations = defineMessages({
  newCourse: {
    id: 'app.common.components.newCourse',
    defaultMessage: 'New Course',
  },
});

const NewCourseButton = (): JSX.Element => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { t } = useTranslation();

  const minWidthForAddButtonWithText = useMediaQuery('(min-width:720px)');

  return (
    <>
      {minWidthForAddButtonWithText ? (
        <Button onClick={(): void => setIsDialogOpen(true)} variant="outlined">
          {t(translations.newCourse)}
        </Button>
      ) : (
        <AddButton
          onClick={(): void => setIsDialogOpen(true)}
          tooltip={t(translations.newCourse)}
        />
      )}
      <CoursesNew
        onClose={(): void => setIsDialogOpen(false)}
        open={isDialogOpen}
      />
    </>
  );
};

export default NewCourseButton;
