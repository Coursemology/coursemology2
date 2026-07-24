import { useEffect, useMemo } from 'react';
import { Outlet, useParams, useSearchParams } from 'react-router-dom';

import {
  clearActivePreview,
  setActivePreview,
} from 'api/course/Assessment/previewAttemptContext';
import PreviewAttemptContext from 'course/assessment/submission/pages/SubmissionEditIndex/PreviewAttemptContext';
import { useCourseContext } from 'course/container/CourseLoader';

const PreviewAttemptScope = (): JSX.Element => {
  const { submissionId } = useParams();
  const attemptId = Number(submissionId);
  const [params] = useSearchParams();
  const listingParam = params.get('fromListing');
  const listingId = listingParam ? Number(listingParam) : undefined;

  // Forward CourseContainer's outlet context (CourseLayoutData, incl. courseUrl) down
  // to the reused SubmissionEditIndex. A bare <Outlet/> would set the outlet context to
  // undefined, so the child's useCourseContext() — used by the preview banner — would
  // otherwise read undefined on the preview page.
  const courseContext = useCourseContext();

  // Set the singleton SYNCHRONOUSLY in the render body — not in a useEffect. The child
  // SubmissionEditIndex dispatches fetchSubmission in componentDidMount, which fires
  // BEFORE this parent's effects run. A parent renders before its children, so setting
  // it here guarantees the API seam sees the preview context when the child builds its
  // first request URL. Idempotent, so re-running on every render is harmless.
  setActivePreview(attemptId);

  useEffect(() => () => clearActivePreview(), []);

  const previewContext = useMemo(
    () => ({ isPreview: true, attemptId, listingId }),
    [attemptId, listingId],
  );

  return (
    <PreviewAttemptContext.Provider value={previewContext}>
      <Outlet context={courseContext} />
    </PreviewAttemptContext.Provider>
  );
};

export default PreviewAttemptScope;
