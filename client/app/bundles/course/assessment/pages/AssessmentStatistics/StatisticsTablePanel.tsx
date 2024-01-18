import { FC } from 'react';
import { useParams } from 'react-router-dom';
import { AssessmentMarksPerQuestionStats } from 'types/course/statistics/assessmentStatistics';

import { fetchStudentMarkPerQuestion } from 'course/assessment/operations';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';

import StudentMarksPerQuestionTable from './StudentMarksPerQuestionTable';

const StatisticsTablePanel: FC = () => {
  const { assessmentId } = useParams();

  const fetchStudentMarks = (): Promise<AssessmentMarksPerQuestionStats> =>
    fetchStudentMarkPerQuestion(assessmentId!);

  return (
    <Preload render={<LoadingIndicator />} while={fetchStudentMarks}>
      {(data): JSX.Element => {
        return <StudentMarksPerQuestionTable data={data} />;
      }}
    </Preload>
  );
};

export default StatisticsTablePanel;
