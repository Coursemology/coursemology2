import { FC } from 'react';

import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';

import { CourseUserType } from './CourseUserTypeTabs';

const CourseUserTypeDisplayMapper = {
  my_students: translations.myStudents,
  my_students_w_phantom: translations.myStudentsIncludingPhantoms,
  students: translations.students,
  students_w_phantom: translations.studentsIncludingPhantoms,
  staff: translations.staff,
  staff_w_phantom: translations.staffIncludingPhantoms,
};

const CourseUserTypeFragment: FC<{ userType: CourseUserType }> = ({
  userType,
}) => {
  const { t } = useTranslation();

  return <b>{t(CourseUserTypeDisplayMapper[userType]).toLocaleLowerCase()}</b>;
};

export default CourseUserTypeFragment;
