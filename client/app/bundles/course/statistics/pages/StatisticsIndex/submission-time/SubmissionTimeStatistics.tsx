import { FC } from 'react';

import { fetchStudentsBasicInfo } from 'course/users/operations';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';

import SubmissionTimeDetails from './SubmissionTimeDetails';

const SubmissionTimeStatistics: FC = () => {
  return (
    <Preload
      render={<LoadingIndicator />}
      while={() => fetchStudentsBasicInfo(true, true)}
    >
      {(data) => {
        return <SubmissionTimeDetails students={data.userOptions!} />;
      }}
    </Preload>
  );
};

export default SubmissionTimeStatistics;
