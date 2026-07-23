import { PreviewContextValue } from 'course/marketplace/contexts/PreviewContext';

interface RouterMatch {
  params: Record<string, string | undefined>;
}

// Marketplace preview attempts (course/marketplace/pages/PreviewAttempt) reuse this page
// verbatim, but their route carries no `:submissionId` segment — the id is only known after the
// page's loader creates/resumes the attempt and seeds it into PreviewContext. When a preview
// scope is active, source `submissionId` from there instead of the (absent) URL match; mirrors
// the override `SubmissionsAPI` (T11) already applies to its own URL prefix via
// `getActivePreview()`, just via the reactive context rather than the module-scoped accessor
// (this runs during render, so there's no effect-timing race to worry about here).
export function resolveSubmissionMatch(
  match: RouterMatch,
  preview: PreviewContextValue | null,
): RouterMatch {
  if (!preview) return match;

  return {
    ...match,
    params: { ...match.params, submissionId: String(preview.submissionId) },
  };
}
