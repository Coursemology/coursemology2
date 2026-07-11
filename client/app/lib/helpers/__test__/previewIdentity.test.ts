import {
  clearPreviewIdentity,
  resolvePreviewIdentity,
  setPreviewIdentity,
} from 'lib/helpers/previewIdentity';
import {
  getAssessmentId,
  getCourseId,
  getSubmissionId,
} from 'lib/helpers/url-helpers';

const IDENTITY = { courseId: 14, assessmentId: 65, submissionId: 8190 };
const PREVIEW_PATH = '/courses/2/marketplace/listings/10/attempt';

const setPath = (pathname: string): void => {
  window.history.pushState({}, '', pathname);
};

beforeEach(() => {
  clearPreviewIdentity();
  setPath('/');
});

describe('on a preview route', () => {
  it('resolves the identity', () => {
    setPath(PREVIEW_PATH);
    setPreviewIdentity(IDENTITY);

    expect(resolvePreviewIdentity()).toEqual(IDENTITY);
  });

  it('makes the id helpers report the container, not the URL', () => {
    setPath(PREVIEW_PATH);
    setPreviewIdentity(IDENTITY);

    // The URL says course 2 (the previewer's own course) and names no assessment or submission.
    expect(getCourseId()).toBe('14');
    expect(getAssessmentId()).toBe('65');
    expect(getSubmissionId()).toBe('8190');
  });

  it('falls back to the URL when no identity is set', () => {
    setPath(PREVIEW_PATH);

    expect(resolvePreviewIdentity()).toBeNull();
    expect(getCourseId()).toBe('2');
    expect(getAssessmentId()).toBeNull();
    expect(getSubmissionId()).toBeNull();
  });

  it('tolerates a trailing slash', () => {
    setPath(`${PREVIEW_PATH}/`);
    setPreviewIdentity(IDENTITY);

    expect(getCourseId()).toBe('14');
  });
});

// THE INVARIANT. This is what bounds the blast radius of a module-level identity: a stale or leaked
// identity must be inert everywhere except the preview route. If someone widens the route pattern,
// these fail.
describe('the invariant — a set identity is ignored off the preview route', () => {
  it.each([
    [
      'an ordinary submission page',
      '/courses/2/assessments/9/submissions/77/edit',
      '2',
      '9',
      '77',
    ],
    ['a course home', '/courses/2', '2', null, null],
    ['the marketplace index', '/courses/2/marketplace', '2', null, null],
    [
      'a listing preview page',
      '/courses/2/marketplace/listings/10',
      '2',
      null,
      null,
    ],
    [
      'a listing question preview',
      '/courses/2/marketplace/listings/10/questions/3',
      '2',
      null,
      null,
    ],
  ])(
    'ignores it on %s',
    (_label, path, courseId, assessmentId, submissionId) => {
      setPath(path);
      setPreviewIdentity(IDENTITY);

      expect(resolvePreviewIdentity()).toBeNull();
      expect(getCourseId()).toBe(courseId);
      expect(getAssessmentId()).toBe(assessmentId);
      expect(getSubmissionId()).toBe(submissionId);
    },
  );
});

describe('clearPreviewIdentity', () => {
  it('restores URL resolution on the preview route', () => {
    setPath(PREVIEW_PATH);
    setPreviewIdentity(IDENTITY);

    clearPreviewIdentity();

    expect(resolvePreviewIdentity()).toBeNull();
    expect(getCourseId()).toBe('2');
    expect(getSubmissionId()).toBeNull();
  });
});
