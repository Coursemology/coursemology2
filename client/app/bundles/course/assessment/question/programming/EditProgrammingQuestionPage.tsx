import { useParams } from 'react-router-dom';
import {
  ProgrammingPostStatusData,
  ProgrammingResponseData,
} from 'types/course/assessment/question/programming';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';

import buildFormData from './commons/builder';
import { fetchEdit, update } from './operations';
import ProgrammingForm from './ProgrammingForm';

const EditProgrammingQuestionPage = (): JSX.Element => {
  const params = useParams();
  const id = parseInt(params?.questionId ?? '', 10) || undefined;
  if (!id)
    throw new Error(`EditProgrammingQuestionPage was loaded with ID: ${id}.`);

  const fetchData = (): Promise<ProgrammingResponseData> => fetchEdit(id);

  return (
    <Preload render={<LoadingIndicator />} while={fetchData}>
      {(data): JSX.Element => (
        <ProgrammingForm
          assessmentLiveFeedbackEnabled={data.assessmentLiveFeedbackEnabled}
          courseLiveFeedbackEnabled={data.courseLiveFeedbackEnabled}
          onSubmit={(rawData): Promise<ProgrammingPostStatusData> =>
            update(id, buildFormData(rawData))
          }
          revalidate={fetchData}
          with={data}
        />
      )}
    </Preload>
  );
};

export default EditProgrammingQuestionPage;
