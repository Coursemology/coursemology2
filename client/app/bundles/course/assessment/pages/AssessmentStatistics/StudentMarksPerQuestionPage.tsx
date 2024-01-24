import { FC } from 'react';
import { useParams } from 'react-router-dom';
import { AssessmentMarksPerQuestionStats } from 'types/course/statistics/assessmentStatistics';

import { fetchStudentMarkPerQuestion } from 'course/assessment/operations';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';

import StudentMarksPerQuestionTable from './StudentMarksPerQuestionTable';

interface Props {
  includePhantom: boolean;
}

const StudentMarksPerQuestionPage: FC<Props> = (props) => {
  const { includePhantom } = props;
  const { assessmentId } = useParams();

  const fetchStudentMarks = (): Promise<AssessmentMarksPerQuestionStats> =>
    fetchStudentMarkPerQuestion(assessmentId!);

  return (
    <Preload render={<LoadingIndicator />} while={fetchStudentMarks}>
      {(data): JSX.Element => {
        const noPhantomStudentSubmissionsData = {
          ...data,
          submissions: data.submissions.filter((datum) => !datum.isPhantom),
        };
        const displayedData = includePhantom
          ? data
          : noPhantomStudentSubmissionsData;
        return <StudentMarksPerQuestionTable data={displayedData} />;
      }}
    </Preload>
  );
};

export default StudentMarksPerQuestionPage;
