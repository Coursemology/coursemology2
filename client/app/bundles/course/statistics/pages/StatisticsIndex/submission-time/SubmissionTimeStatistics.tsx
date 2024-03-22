import { FC } from 'react';
import {
  CourseUserBasicListData,
  CourseUserListData,
  ManageCourseUsersPermissions,
  ManageCourseUsersSharedData,
} from 'types/course/courseUsers';

import { fetchStudentsBasicInfo } from 'course/users/operations';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';

import SubmissionTimeDetails from './SubmissionTimeDetails';

const SubmissionTimeStatistics: FC = () => {
  const fetchAllStudentsBasicInfo = (): Promise<{
    users: CourseUserListData[];
    userOptions?: CourseUserBasicListData[] | undefined;
    permissions?: ManageCourseUsersPermissions | undefined;
    manageCourseUsersData?: ManageCourseUsersSharedData | undefined;
  }> => {
    return fetchStudentsBasicInfo(true, true);
  };

  return (
    <Preload render={<LoadingIndicator />} while={fetchAllStudentsBasicInfo}>
      {(data) => <SubmissionTimeDetails students={data.userOptions!} />}
    </Preload>
  );
};

export default SubmissionTimeStatistics;
