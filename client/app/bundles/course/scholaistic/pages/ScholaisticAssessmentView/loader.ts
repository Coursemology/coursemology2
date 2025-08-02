import { LoaderFunction, useLoaderData } from 'react-router-dom';
import { ScholaisticAssessmentViewData } from 'types/course/scholaistic';
import { getIdFromUnknown } from 'utilities';

import CourseAPI from 'api/course';
import { setHandle } from 'course/scholaistic/handles';

export const loader: LoaderFunction = async ({
  params,
}): Promise<ScholaisticAssessmentViewData> => {
  const { data } = await CourseAPI.scholaistic.fetchAssessment(
    getIdFromUnknown(params.assessmentId)!,
  );

  setHandle('assessments', data.display.assessmentsTitle);
  setHandle('assessment', data.display.assessmentTitle);

  return data;
};

export const useLoader = (): ScholaisticAssessmentViewData =>
  useLoaderData() as ScholaisticAssessmentViewData;
