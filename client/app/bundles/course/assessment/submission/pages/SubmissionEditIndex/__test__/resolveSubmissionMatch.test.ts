import { resolveSubmissionMatch } from '../resolveSubmissionMatch';

// Marketplace preview attempts (course/marketplace/pages/PreviewAttempt) reuse this page, but
// their route carries no `:submissionId` segment — the id is only known after the page's loader
// creates/resumes the attempt and seeds it into PreviewContext. `resolveSubmissionMatch` is the
// pure override this page's `withPreviewAwareMatch` wrapper applies so `componentDidMount`'s
// `match.params.submissionId` read still resolves correctly in that case.
describe('resolveSubmissionMatch', () => {
  const match = {
    params: { courseId: '1', assessmentId: '2', submissionId: undefined },
  };

  it('returns the match unchanged when no preview scope is active', () => {
    expect(resolveSubmissionMatch(match, null)).toBe(match);
  });

  it('overrides submissionId from the active preview scope, preserving the other params', () => {
    const preview = {
      courseId: 5,
      assessmentId: 9,
      submissionId: 42,
      isPreview: true as const,
    };

    expect(resolveSubmissionMatch(match, preview)).toEqual({
      params: { courseId: '1', assessmentId: '2', submissionId: '42' },
    });
  });
});
