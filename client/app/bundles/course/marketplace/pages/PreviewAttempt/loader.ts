import { LoaderFunction } from 'react-router-dom';
import { getIdFromUnknown } from 'utilities';

import CourseAPI from 'api/course';
import {
  clearPreviewIdentity,
  setPreviewIdentity,
} from 'lib/helpers/previewIdentity';
import { Translated } from 'lib/hooks/useTranslation';

import { fetchListing } from '../../operations';
import { PreviewAttemptData } from '../../types';

// The identity is seeded HERE, in the loader, before the submission page mounts: that page resolves
// its course/assessment/submission ids from lib/helpers/url-helpers on its very first render and
// fetch, and the masked URL names none of them.
//
// Kept in its own module (rather than in index.tsx) so it can be tested without importing
// SubmissionEditIndex and the whole submission bundle behind it.
export const previewAttemptLoader: Translated<LoaderFunction> =
  () =>
  async ({ params }): Promise<PreviewAttemptData> => {
    const listingId = getIdFromUnknown(params?.listingId);
    if (!listingId) throw new Error('Missing listing id');

    // Clear FIRST. MarketplaceAPI builds its URLs from getCourseId(), which is shimmed on this very
    // route: an identity left over from an earlier preview would address both requests below to the
    // *container* course, which the container lock bounces.
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

    return { listingTitle: listing.title };
  };

export default previewAttemptLoader;
