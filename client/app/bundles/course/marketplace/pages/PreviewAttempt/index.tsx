import { useEffect } from 'react';
import { Outlet, useParams, useSearchParams } from 'react-router-dom';

import {
  clearActivePreview,
  setActivePreview,
} from 'api/course/Assessment/previewAttemptContext';
import PreviewAttemptContext from 'course/assessment/submission/pages/SubmissionEditIndex/PreviewAttemptContext';

const PreviewAttemptScope = (): JSX.Element => {
  const { submissionId } = useParams();
  const attemptId = Number(submissionId);
  const [params] = useSearchParams();
  const listingParam = params.get('fromListing');
  const listingId = listingParam ? Number(listingParam) : undefined;

  // Set the singleton SYNCHRONOUSLY in the render body — not in a useEffect. The child
  // SubmissionEditIndex dispatches fetchSubmission in componentDidMount, which fires
  // BEFORE this parent's effects run. A parent renders before its children, so setting
  // it here guarantees the API seam sees the preview context when the child builds its
  // first request URL. Idempotent, so re-running on every render is harmless.
  setActivePreview(attemptId);

  useEffect(() => () => clearActivePreview(), []);

  return (
    <PreviewAttemptContext.Provider
      value={{ isPreview: true, attemptId, listingId }}
    >
      <Outlet />
    </PreviewAttemptContext.Provider>
  );
};

export default PreviewAttemptScope;
