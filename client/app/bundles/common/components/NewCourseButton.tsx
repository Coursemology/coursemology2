import { useState } from 'react';
import { defineMessages } from 'react-intl';

import CoursesNew from 'course/courses/pages/CoursesNew';
import AddButton from 'lib/components/core/buttons/AddButton';
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
      <AddButton onClick={(): void => setIsDialogOpen(true)}>
        {t(translations.newCourse)}
      </AddButton>

      <CoursesNew
        onClose={(): void => setIsDialogOpen(false)}
        open={isDialogOpen}
      />
    </>
  );
};

export default NewCourseButton;
