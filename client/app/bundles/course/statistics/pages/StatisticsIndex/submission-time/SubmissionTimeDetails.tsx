import { FC } from 'react';
import { useParams } from 'react-router-dom';

import { fetchSubmissionDueStatistics } from 'course/statistics/operations';
import { SubmissionTimeStatistics } from 'course/statistics/types';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';

import SubmissionTimeTable from './SubmissionTimeTable';

const SubmissionTimeDetails: FC = () => {
  const { studentId } = useParams();

  const fetchSubmissionDue = (): Promise<SubmissionTimeStatistics> =>
    fetchSubmissionDueStatistics(Number(studentId!));

  return (
    <Preload render={<LoadingIndicator />} while={fetchSubmissionDue}>
      {(data) => {
        return <SubmissionTimeTable data={data} />;
      }}
    </Preload>
  );
};

export default SubmissionTimeDetails;
