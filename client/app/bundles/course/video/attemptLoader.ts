import { LoaderFunction, Params, redirect } from 'react-router-dom';
import { getIdFromUnknown } from 'utilities';

import CourseAPI from 'api/course';

const getSubmissionURL = (
  params: Params<string>,
  submissionId: number,
): string | null => {
  const courseId = getIdFromUnknown(params?.courseId);
  const videoId = getIdFromUnknown(params?.videoId);
  if (!courseId || !videoId) return null;

  return `/courses/${courseId}/videos/${videoId}/submissions/${submissionId}/edit`;
};

const videoAttemptLoader: LoaderFunction = async ({ params }) => {
  const videoId = getIdFromUnknown(params?.videoId);
  if (!videoId) return redirect('/');

  const { data } = await CourseAPI.video.submissions.create(videoId);

  const url = data.submissionUrl ?? getSubmissionURL(params, data.submissionId);
  if (!url) return redirect('/');

  return redirect(url);
};

export default videoAttemptLoader;
