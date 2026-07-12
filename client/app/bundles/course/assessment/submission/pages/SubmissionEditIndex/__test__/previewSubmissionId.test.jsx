import { render, waitFor } from 'test-utils';

import CourseAPI from 'api/course';
import {
  clearPreviewIdentity,
  setPreviewIdentity,
} from 'lib/helpers/previewIdentity';

import SubmissionEditIndex from '../index';

// react-markdown (pulled in transitively by the submission form) ships ESM that
// this repo's jest config does not transform; the page cannot mount without this.
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: () => null,
  defaultUrlTransform: (url) => url,
}));

const PREVIEW_PATH = '/courses/2/marketplace/listings/10/attempt';
const IDENTITY = { courseId: 14, assessmentId: 65, submissionId: 8190 };

describe('<SubmissionEditIndex /> submission id resolution', () => {
  let editSpy;

  beforeEach(() => {
    clearPreviewIdentity();
    window.history.pushState({}, '', PREVIEW_PATH);
    // Rejecting keeps the page in its loading/failure state so no sub-forms
    // mount; all we assert is which submission id the fetch was addressed to.
    editSpy = jest
      .spyOn(CourseAPI.assessment.submissions, 'edit')
      .mockRejectedValue(new Error('stop the fetch here'));
  });

  afterEach(() => {
    jest.restoreAllMocks();
    clearPreviewIdentity();
    window.history.pushState({}, '', '/');
  });

  // On the masked preview route the URL carries no :submissionId route param, so
  // the page must resolve it from the preview identity — the same shim that
  // already re-points the course and assessment ids at the hidden container.
  // Without this it fetches submission `undefined` and renders an empty page.
  it('fetches the preview identity’s submission when the route carries no submissionId', async () => {
    setPreviewIdentity(IDENTITY);

    render(<SubmissionEditIndex />);

    await waitFor(() => expect(editSpy).toHaveBeenCalledWith('8190'));
  });
});
