import { defineMessages } from 'react-intl';
import { LoaderFunction, Params, redirect } from 'react-router-dom';
import { getIdFromUnknown } from 'utilities';

import CourseAPI from 'api/course';
import toast from 'lib/hooks/toast';
import { Translated } from 'lib/hooks/useTranslation';

const translations = defineMessages({
  errorWatchVideo: {
    id: 'client.video.attemptLoader.errorWatchVideo',
    defaultMessage:
      'An error occurred while attempting to watch this video. Try again later.',
  },
});

const getSubmissionURL = (
  params: Params<string>,
  submissionId: number,
): string | null => {
  const courseId = getIdFromUnknown(params?.courseId);
  const videoId = getIdFromUnknown(params?.videoId);
  if (!courseId || !videoId) return null;

  return `/courses/${courseId}/videos/${videoId}/submissions/${submissionId}/edit`;
};

const videoAttemptLoader: Translated<LoaderFunction> =
  (t) =>
  async ({ params }) => {
    try {
      const videoId = getIdFromUnknown(params?.videoId);
      if (!videoId) return redirect('/');

      const { data } = await CourseAPI.video.submissions.create(videoId);

      const url = getSubmissionURL(params, data.submissionId);
      if (!url) return redirect('/');

      return redirect(url);
    } catch {
      toast.error(t(translations.errorWatchVideo));

      const { courseId } = params;
      if (!courseId) return redirect('/');

      return redirect(`/courses/${courseId}/videos`);
    }
  };

export default videoAttemptLoader;
