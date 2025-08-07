import { defer, LoaderFunction, useAsyncValue } from 'react-router-dom';
import { ScholaisticAssessmentSubmissionsIndexData } from 'types/course/scholaistic';
import { getIdFromUnknown } from 'utilities';

import CourseAPI from 'api/course';
import { setAsyncHandle } from 'course/scholaistic/handles';

export const loader: LoaderFunction = async ({ params }) =>
  defer({
    promise: (async (): Promise<ScholaisticAssessmentSubmissionsIndexData> => {
      const promise = CourseAPI.scholaistic.fetchSubmissions(
        getIdFromUnknown(params.assessmentId)!,
      );

      setAsyncHandle(
        promise.then(({ data }) => ({
          assessments: data.display.assessmentsTitle,
          assessment: data.display.assessmentTitle,
        })),
      );

      return (await promise).data;
    })(),
  });

export const useLoader = (): ScholaisticAssessmentSubmissionsIndexData =>
  useAsyncValue() as ScholaisticAssessmentSubmissionsIndexData;
