import { useState } from 'react';
import { defineMessages } from 'react-intl';

import CoursesNew from 'course/courses/pages/CoursesNew';
import useTranslation from 'lib/hooks/useTranslation';
import WidthAdjustedNewButton from './WidthAdjustedNewButton';

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
      <WidthAdjustedNewButton
        minWidth={720}
        textButtonKey="new-course-button"
        textButtonClassName="new-course-button"
        nonTextButtonKey="new-course-button"
        nonTextButtonClassName="new-course-button"
        onClick={(): void => setIsDialogOpen(true)}
        text={t(translations.newCourse)}
      />
      <CoursesNew
        onClose={(): void => setIsDialogOpen(false)}
        open={isDialogOpen}
      />
    </>
  );
};

export default NewCourseButton;
