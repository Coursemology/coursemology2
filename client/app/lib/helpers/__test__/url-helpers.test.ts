import { getSubmissionId } from '../url-helpers';

const setPath = (path: string): void => {
  window.history.pushState({}, '', path);
};

describe('getSubmissionId', () => {
  it('reads the submission id from a submission edit URL', () => {
    setPath('/courses/3/assessments/9/submissions/5/edit');
    expect(getSubmissionId()).toBe('5');
  });

  it('reads the attempt id from a marketplace preview attempt URL', () => {
    // The preview page reuses the submission edit UI on a shallow attempt URL that has
    // no /assessments/:aid/submissions segment. The attempt id plays the submission id,
    // so pollers/buttons deriving the id from the URL must not fall through to null and
    // emit /marketplace/attempt/null/...
    setPath('/courses/3/marketplace/attempt/5/edit');
    expect(getSubmissionId()).toBe('5');
  });

  it('returns null when the path is neither a submission nor a preview attempt', () => {
    setPath('/courses/3/assessments/9');
    expect(getSubmissionId()).toBeNull();
  });
});
