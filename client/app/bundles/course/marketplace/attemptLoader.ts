import { defineMessages } from 'react-intl';
import { LoaderFunction, redirect } from 'react-router-dom';
import { getIdFromUnknown } from 'utilities';

import CourseAPI from 'api/course';
import toast from 'lib/hooks/toast';
import { Translated } from 'lib/hooks/useTranslation';

const translations = defineMessages({
  errorAttemptingListing: {
    id: 'course.marketplace.attemptLoader.errorAttemptingListing',
    defaultMessage:
      'An error occurred while opening this assessment. Try again later.',
  },
});

// Provisions the previewer's copy of the listing in the marketplace container course, then hands off
// to that copy's own attempt route — whose loader creates or resumes the submission the normal way.
// Two hops, but no part of the real attempt flow is duplicated.
const listingAttemptLoader: Translated<LoaderFunction> =
  (t) =>
  async ({ params }) => {
    const { courseId } = params;

    try {
      const listingId = getIdFromUnknown(params?.listingId);
      if (!listingId) return redirect('/');

      const { data } = await CourseAPI.marketplace.attempt(listingId);

      return redirect(data.redirectUrl);
    } catch {
      toast.error(t(translations.errorAttemptingListing));

      if (!courseId) return redirect('/');

      return redirect(`/courses/${courseId}/marketplace`);
    }
  };

export default listingAttemptLoader;
