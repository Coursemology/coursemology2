import { defer, LoaderFunction, useAsyncValue } from 'react-router-dom';
import { ScholaisticAssessmentEditData } from 'types/course/scholaistic';
import { getIdFromUnknown } from 'utilities';

import CourseAPI from 'api/course';
import { setAsyncHandle } from 'course/scholaistic/handles';

export const loader: LoaderFunction = ({ params }) =>
  defer({
    promise: (async (): Promise<ScholaisticAssessmentEditData> => {
      const promise = CourseAPI.scholaistic.fetchEditAssessment(
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

export const useLoader = (): ScholaisticAssessmentEditData =>
  useAsyncValue() as ScholaisticAssessmentEditData;
