/**
 * Module-level marker for "the current page is a marketplace preview attempt".
 *
 * The reused submission API (`SubmissionsAPI`, `ScribingsAPI`) builds its URLs from
 * the browser path. A preview URL (`/courses/:c/marketplace/attempt/:id`) has no
 * `/assessments/:aid` segment, so the API must be told to route to the shallow
 * `/marketplace/attempt/...` endpoints instead. This singleton is that signal.
 *
 * It is a plain module variable (not React context) because the API layer runs
 * outside React and cannot read context.
 */
let activePreviewAttemptId: number | null = null;

export const setActivePreview = (attemptId: number): void => {
  activePreviewAttemptId = attemptId;
};

export const clearActivePreview = (): void => {
  activePreviewAttemptId = null;
};

export const getActivePreview = (): number | null => activePreviewAttemptId;
