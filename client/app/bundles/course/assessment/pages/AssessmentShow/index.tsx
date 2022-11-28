import { useParams } from 'react-router-dom';
import { AssessmentData } from 'types/course/assessment/assessments';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';

import { fetchAssessment } from '../../actions';

import AssessmentShowPage from './AssessmentShowPage';

const AssessmentShow = (): JSX.Element => {
  const params = useParams();
  const id = parseInt(params?.assessmentId ?? '', 10) || undefined;
  if (!id) throw new Error(`AssessmentShow was loaded with ID: ${id}.`);

  const fetchAssessmentWithId = async (): Promise<AssessmentData> =>
    (await fetchAssessment(id)) as AssessmentData;

  return (
    <Preload render={<LoadingIndicator />} while={fetchAssessmentWithId}>
      {(data): JSX.Element => <AssessmentShowPage for={data} />}
    </Preload>
  );
};

export default AssessmentShow;
