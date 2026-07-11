export interface PreviewIdentity {
  courseId: number;
  assessmentId: number;
  submissionId: number;
}

/**
 * The marketplace preview renders the platform's real submission page under a masked URL that names
 * neither the container course nor the submission. Page identity in this app is resolved from
 * `window.location` (see url-helpers), so the preview seeds this identity and the id helpers read it
 * instead of the path.
 *
 * It is honoured ONLY on a preview route. That is the invariant that makes a module-level mutable
 * identity safe here: a stale one cannot re-point an ordinary course page's requests at the
 * container, because off the preview route the helpers ignore it entirely.
 */
const PREVIEW_PATH = /^\/courses\/\d+\/marketplace\/listings\/\d+\/attempt\/?$/;

let identity: PreviewIdentity | null = null;

export const setPreviewIdentity = (next: PreviewIdentity): void => {
  identity = next;
};

export const clearPreviewIdentity = (): void => {
  identity = null;
};

export const resolvePreviewIdentity = (): PreviewIdentity | null => {
  if (!PREVIEW_PATH.test(window.location.pathname)) return null;

  return identity;
};
