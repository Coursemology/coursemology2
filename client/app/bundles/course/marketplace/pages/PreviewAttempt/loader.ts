import { LoaderFunction, redirect } from 'react-router-dom';
import { getIdFromUnknown } from 'utilities';

import CourseAPI from 'api/course';
import {
  clearPreviewIdentity,
  setPreviewIdentity,
} from 'lib/helpers/previewIdentity';
import toast from 'lib/hooks/toast';
import { Translated } from 'lib/hooks/useTranslation';

import { fetchListing } from '../../operations';
import translations from '../../translations';
import { PreviewAttemptData } from '../../types';

// The identity is seeded HERE, in the loader, before the submission page mounts: that page resolves
// its course/assessment/submission ids from lib/helpers/url-helpers on its very first render and
// fetch, and the masked URL names none of them.
//
// Kept in its own module (rather than in index.tsx) so it can be tested without importing
// SubmissionEditIndex and the whole submission bundle behind it.
export const previewAttemptLoader: Translated<LoaderFunction> =
  (t) =>
  async ({ params }): Promise<PreviewAttemptData | Response> => {
    const { courseId } = params;

    try {
      const listingId = getIdFromUnknown(params?.listingId);
      if (!listingId) return redirect('/');

      // Reset FIRST, then set below: this is the one place the preview identity is cleared (the page
      // deliberately does not clear on unmount — see PreviewAttempt/index.tsx). Clearing here means a
      // leftover identity from an earlier preview cannot be read by the reused submission page before
      // this load sets its own. (The marketplace requests below are unaffected either way —
      // MarketplaceAPI resolves the visible course directly, not through the identity shim.)
      clearPreviewIdentity();

      const [{ data: attempt }, listing] = await Promise.all([
        CourseAPI.marketplace.attempt(listingId),
        fetchListing(listingId),
      ]);

      setPreviewIdentity({
        courseId: attempt.courseId,
        assessmentId: attempt.assessmentId,
        submissionId: attempt.submissionId,
      });

      return {
        listingTitle: listing.title,
        previewGradingInert: listing.previewGradingInert,
      };
    } catch {
      toast.error(t(translations.errorAttemptingListing));

      if (!courseId) return redirect('/');

      return redirect(`/courses/${courseId}/marketplace`);
    }
  };

export default previewAttemptLoader;
