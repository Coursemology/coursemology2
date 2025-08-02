import { LoaderFunction, redirect, useLoaderData } from 'react-router-dom';
import { ScholaisticAssessmentSubmissionEditData } from 'types/course/scholaistic';
import { getIdFromUnknown } from 'utilities';

import CourseAPI from 'api/course';
import { setHandle } from 'course/scholaistic/handles';

export const loader: LoaderFunction = async ({
  params,
}): Promise<ScholaisticAssessmentSubmissionEditData> => {
  const { data } = await CourseAPI.scholaistic.fetchSubmission(
    getIdFromUnknown(params.assessmentId)!,
    params.submissionId!,
  );

  setHandle('assessments', data.display.assessmentsTitle);
  setHandle('assessment', data.display.assessmentTitle);
  setHandle('submission', data.display.creatorName);

  return data;
};

export const useLoader = (): ScholaisticAssessmentSubmissionEditData =>
  useLoaderData() as ScholaisticAssessmentSubmissionEditData;

export const submissionLoader: LoaderFunction = async ({ params }) => {
  const assessmentId = getIdFromUnknown(params.assessmentId)!;

  const { data } =
    await CourseAPI.scholaistic.findOrCreateSubmission(assessmentId);

  return redirect(
    `/courses/${params.courseId!}/scholaistic/assessments/${assessmentId}/submissions/${data.id}`,
  );
};
