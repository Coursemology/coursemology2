import {
  defer,
  LoaderFunction,
  redirect,
  useAsyncValue,
} from 'react-router-dom';
import { ScholaisticAssessmentSubmissionEditData } from 'types/course/scholaistic';
import { getIdFromUnknown } from 'utilities';

import CourseAPI from 'api/course';
import { setAsyncHandle } from 'course/scholaistic/handles';

export const loader: LoaderFunction = ({ params }) =>
  defer({
    promise: (async (): Promise<ScholaisticAssessmentSubmissionEditData> => {
      const promise = CourseAPI.scholaistic.fetchSubmission(
        getIdFromUnknown(params.assessmentId)!,
        params.submissionId!,
      );

      setAsyncHandle(
        promise.then(({ data }) => ({
          assessments: data.display.assessmentsTitle,
          assessment: data.display.assessmentTitle,
          submission: data.display.creatorName,
        })),
      );

      return (await promise).data;
    })(),
  });

export const useLoader = (): ScholaisticAssessmentSubmissionEditData =>
  useAsyncValue() as ScholaisticAssessmentSubmissionEditData;

export const submissionLoader: LoaderFunction = async ({ params }) => {
  const assessmentId = getIdFromUnknown(params.assessmentId)!;

  const { data } =
    await CourseAPI.scholaistic.findOrCreateSubmission(assessmentId);

  return redirect(
    `/courses/${params.courseId!}/scholaistic/assessments/${assessmentId}/submissions/${data.id}`,
  );
};
