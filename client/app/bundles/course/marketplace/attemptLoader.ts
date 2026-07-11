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

// Provisions the previewer's copy of the listing in the marketplace container course. The endpoint
// redirects server-side into the platform's own attempt action, so the response we get back is
// already that action's { redirectUrl } — the submission itself. One hop from here: the previewer
// lands directly in the submission, never on an assessments index.
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
