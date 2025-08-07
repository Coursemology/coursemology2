import { defer, LoaderFunction, useAsyncValue } from 'react-router-dom';
import { ScholaisticAssessmentNewData } from 'types/course/scholaistic';

import CourseAPI from 'api/course';
import { setAsyncHandle } from 'course/scholaistic/handles';

export const loader: LoaderFunction = () =>
  defer({
    promise: (async (): Promise<ScholaisticAssessmentNewData> => {
      const promise = CourseAPI.scholaistic.fetchNewAssessment();

      setAsyncHandle(
        promise.then(({ data }) => ({
          assessments: data.display.assessmentsTitle,
        })),
      );

      return (await promise).data;
    })(),
  });

export const useLoader = (): ScholaisticAssessmentNewData =>
  useAsyncValue() as ScholaisticAssessmentNewData;
