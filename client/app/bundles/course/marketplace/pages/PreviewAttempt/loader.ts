import { LoaderFunctionArgs } from 'react-router-dom';

import CourseAPI from 'api/course';
import {
  PreviewContextValue,
  setActivePreview,
} from 'course/marketplace/contexts/PreviewContext';

interface PreviewAttemptRouteData {
  courseId: number;
  assessmentId: number;
  submissionId: number;
  listingId: number;
}

// Creates/resumes the preview attempt and returns the ids `PreviewAttemptRoute` (index.tsx)
// hands to `PreviewAttemptPage` as props, before `SubmissionEditIndex` mounts and the
// submission API (T11) reads them.
//
// This also seeds PreviewContext itself, eagerly — not only relying on the page's own mount
// effect (or `PreviewProvider`'s internal one, T10). Loaders resolve fully *before* React starts
// rendering the route element, whereas `useEffect` only fires as a *passive* effect: strictly
// after every layout-phase effect in the freshly mounted tree, including `SubmissionEditIndex`'s
// class-based `componentDidMount`, which synchronously dispatches the very first submission
// fetch. Without seeding here, that first fetch would read a stale (non-preview)
// `getActivePreview()` and miss the preview-scoped submissions URL — the one integration seam
// this task's brief flagged as needing to be got right, not just unit-tested (RTL's `act()`
// flushes passive effects synchronously, which would mask this exact race in a component test).
//
// This is one of three sites that set the same-valued scope (this loader, the page's mount
// effect, and `PreviewProvider`'s own internal effect, T10) and one of two that clear it (the
// page's cleanup, and `PreviewAttemptErrorElement` below) — deliberately redundant, not dead
// code: each covers a window the others don't (this one covers the layout-vs-passive-effect
// race above; the page's own effect covers id changes on an already-mounted page; the error
// element covers a render throw before any effect commits).
//
// `request.signal` is checked *after* the POST resolves, not before starting it: a loader cannot
// abort an in-flight request when its navigation is superseded (the user navigated away before
// the POST settled), and the promise still runs to completion regardless. But if the signal is
// aborted by the time it resolves, React Router will never mount this route's element — so no
// cleanup effect ever registers to null the scope back out. Skipping the set in that case (rather
// than setting it and relying on a cleanup that will never run) is what closes that leak window.
export const previewAttemptLoader =
  () =>
  async ({
    params,
    request,
  }: LoaderFunctionArgs): Promise<PreviewAttemptRouteData> => {
    const courseId = Number(params.courseId);
    const listingId = Number(params.listingId);
    const { data } =
      await CourseAPI.marketplace.createPreviewAttempt(listingId);
    const assessmentId = data.assessmentId;
    const submissionId = data.id;

    if (!request.signal.aborted) {
      const scope: PreviewContextValue = {
        courseId,
        assessmentId,
        submissionId,
        isPreview: true,
      };
      setActivePreview(scope);
    }

    return { courseId, assessmentId, submissionId, listingId };
  };
