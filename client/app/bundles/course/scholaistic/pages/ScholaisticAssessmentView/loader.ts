import { defer, LoaderFunction, useAsyncValue } from 'react-router-dom';
import { ScholaisticAssessmentViewData } from 'types/course/scholaistic';
import { getIdFromUnknown } from 'utilities';

import CourseAPI from 'api/course';
import { setAsyncHandle } from 'course/scholaistic/handles';

export const loader: LoaderFunction = ({ params }) =>
  defer({
    promise: (async (): Promise<ScholaisticAssessmentViewData> => {
      const promise = CourseAPI.scholaistic.fetchAssessment(
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

export const useLoader = (): ScholaisticAssessmentViewData =>
  useAsyncValue() as ScholaisticAssessmentViewData;
