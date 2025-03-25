import { SyntheticEvent } from 'react';
import { Tab, Tabs } from '@mui/material';
import palette from 'theme/palette';

import useTranslation from 'lib/hooks/useTranslation';
import translations from 'lib/translations';

// This parameter gest passed into the backend as course_users
// for certain queries in Assessments API, to let it know which course users to filter against.
export enum CourseUserType {
  MY_STUDENTS = 'my_students',
  MY_STUDENTS_W_PHANTOM = 'my_students_w_phantom',
  STUDENTS = 'students',
  STUDENTS_W_PHANTOM = 'students_w_phantom',
  STAFF = 'staff',
  STAFF_W_PHANTOM = 'staff_w_phantom',
}

export enum CourseUserTypeTabValue {
  MY_STUDENTS_TAB = 'my-students-tab',
  STUDENTS_TAB = 'students-tab',
  STAFF_TAB = 'staff-tab',
}

const TabCourseUserTypeNormalMapper = {
  [CourseUserTypeTabValue.MY_STUDENTS_TAB]: CourseUserType.MY_STUDENTS,
  [CourseUserTypeTabValue.STUDENTS_TAB]: CourseUserType.STUDENTS,
  [CourseUserTypeTabValue.STAFF_TAB]: CourseUserType.STAFF,
};

const TabCourseUserTypePhantomMapper = {
  [CourseUserTypeTabValue.MY_STUDENTS_TAB]:
    CourseUserType.MY_STUDENTS_W_PHANTOM,
  [CourseUserTypeTabValue.STUDENTS_TAB]: CourseUserType.STUDENTS_W_PHANTOM,
  [CourseUserTypeTabValue.STAFF_TAB]: CourseUserType.STAFF_W_PHANTOM,
};

export const getCurrentSelectedUserType = (
  tab: CourseUserTypeTabValue,
  isIncludingPhantoms: boolean,
): CourseUserType =>
  isIncludingPhantoms
    ? TabCourseUserTypePhantomMapper[tab]
    : TabCourseUserTypeNormalMapper[tab];

interface CourseUserTypeTabsProps {
  myStudentsExist: boolean;
  value: CourseUserTypeTabValue;
  onChange: (event: SyntheticEvent, value: CourseUserTypeTabValue) => void;
}

const CourseUserTypeTabs = (props: CourseUserTypeTabsProps): JSX.Element => {
  const { myStudentsExist, value, onChange } = props;
  const { t } = useTranslation();
  return (
    <Tabs
      className="border-only-y-neutral-200"
      onChange={onChange}
      value={value}
      variant="fullWidth"
    >
      {myStudentsExist && (
        <Tab
          id="my-students-tab"
          label={t(translations.myStudents)}
          style={{ color: palette.submissionIcon.person }}
          value={CourseUserTypeTabValue.MY_STUDENTS_TAB}
        />
      )}
      <Tab
        id="students-tab"
        label={t(translations.students)}
        value={CourseUserTypeTabValue.STUDENTS_TAB}
      />

      <Tab
        id="staff-tab"
        label={t(translations.staff)}
        value={CourseUserTypeTabValue.STAFF_TAB}
      />
    </Tabs>
  );
};

export default CourseUserTypeTabs;
