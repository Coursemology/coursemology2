import { LoaderFunction, useLoaderData } from 'react-router-dom';
import { ScholaisticAssessmentNewData } from 'types/course/scholaistic';

import CourseAPI from 'api/course';
import { setHandle } from 'course/scholaistic/handles';

export const loader: LoaderFunction =
  async (): Promise<ScholaisticAssessmentNewData> => {
    const { data } = await CourseAPI.scholaistic.fetchNewAssessment();

    setHandle('assessments', data.display.assessmentsTitle);

    return data;
  };

export const useLoader = (): ScholaisticAssessmentNewData =>
  useLoaderData() as ScholaisticAssessmentNewData;
