import { defer, LoaderFunction, useAsyncValue } from 'react-router-dom';
import { ScholaisticAssessmentsIndexData } from 'types/course/scholaistic';

import CourseAPI from 'api/course';
import { setAsyncHandle } from 'course/scholaistic/handles';

export const loader: LoaderFunction = () =>
  defer({
    promise: (async (): Promise<ScholaisticAssessmentsIndexData> => {
      const promise = CourseAPI.scholaistic.fetchAssessments();

      setAsyncHandle(
        promise.then(({ data }) => ({
          assessments: data.display.assessmentsTitle,
        })),
      );

      return (await promise).data;
    })(),
  });

export const useLoader = (): ScholaisticAssessmentsIndexData =>
  useAsyncValue() as ScholaisticAssessmentsIndexData;
