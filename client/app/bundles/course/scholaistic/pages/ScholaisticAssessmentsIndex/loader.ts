import { LoaderFunction, useLoaderData } from 'react-router-dom';
import { ScholaisticAssessmentsIndexData } from 'types/course/scholaistic';

import CourseAPI from 'api/course';
import { setHandle } from 'course/scholaistic/handles';

export const loader: LoaderFunction =
  async (): Promise<ScholaisticAssessmentsIndexData> => {
    const { data } = await CourseAPI.scholaistic.fetchAssessments();

    setHandle('assessments', data.display.assessmentsTitle);

    return data;
  };

export const useLoader = (): ScholaisticAssessmentsIndexData =>
  useLoaderData() as ScholaisticAssessmentsIndexData;
