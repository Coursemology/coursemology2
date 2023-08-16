import { defineMessages } from 'react-intl';
import { LoaderFunction, redirect } from 'react-router-dom';
import { getIdFromUnknown } from 'utilities';

import CourseAPI from 'api/course';
import toast from 'lib/hooks/toast';
import { Translated } from 'lib/hooks/useTranslation';

const translations = defineMessages({
  errorAttemptingAssessment: {
    id: 'assessment.attemptLoader.errorAttemptingAssessment',
    defaultMessage:
      'An error occurred while attempting this assessment. Try again later.',
  },
});

const assessmentAttemptLoader: Translated<LoaderFunction> =
  (t) =>
  async ({ params }) => {
    try {
      const assessmentId = getIdFromUnknown(params?.assessmentId);
      if (!assessmentId) return redirect('/');

      const { data } =
        await CourseAPI.assessment.assessments.attempt(assessmentId);

      return redirect(data.redirectUrl);
    } catch {
      toast.error(t(translations.errorAttemptingAssessment));

      const { courseId } = params;
      if (!courseId) return redirect('/');

      return redirect(`/courses/${courseId}/assessments`);
    }
  };

export default assessmentAttemptLoader;
