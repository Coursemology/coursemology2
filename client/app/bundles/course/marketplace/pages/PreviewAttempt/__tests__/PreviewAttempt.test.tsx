import { render, screen } from 'test-utils';

import { setActivePreview } from 'course/marketplace/contexts/PreviewContext';

import PreviewAttemptPage, { PreviewAttemptErrorElement } from '../index';

jest.mock('course/assessment/submission/pages/SubmissionEditIndex', () => ({
  __esModule: true,
  default: (): JSX.Element => <div data-testid="submission-edit" />,
}));

jest.mock('../PreviewBanner', () => ({
  __esModule: true,
  default: (): JSX.Element => <div>Private sandbox</div>,
}));

// Keep the real PreviewProvider (tree still renders) but spy on the module-level setActivePreview —
// that side effect (which the submission API reads via getActivePreview) IS this page's contract.
jest.mock('course/marketplace/contexts/PreviewContext', () => ({
  ...jest.requireActual('course/marketplace/contexts/PreviewContext'),
  setActivePreview: jest.fn(),
}));

const mockedSetActivePreview = setActivePreview as jest.Mock;

beforeEach(() => mockedSetActivePreview.mockClear());

describe('PreviewAttemptPage', () => {
  it('wraps the reused submission page in a preview scope', async () => {
    render(
      <PreviewAttemptPage
        assessmentId={9}
        courseId={5}
        listingId={70}
        submissionId={42}
      />,
    );
    expect(await screen.findByTestId('submission-edit')).toBeInTheDocument();
  });

  it('renders the sandbox banner above the reused submission page', async () => {
    render(
      <PreviewAttemptPage
        assessmentId={9}
        courseId={5}
        listingId={70}
        submissionId={42}
      />,
    );

    expect(await screen.findByText(/private sandbox/i)).toBeVisible();
  });

  it('seeds the active preview with the exact ids on mount', async () => {
    render(
      <PreviewAttemptPage
        assessmentId={9}
        courseId={5}
        listingId={70}
        submissionId={42}
      />,
    );
    await screen.findByTestId('submission-edit');
    expect(mockedSetActivePreview).toHaveBeenCalledWith({
      courseId: 5,
      assessmentId: 9,
      submissionId: 42,
      isPreview: true,
    });
    expect(mockedSetActivePreview).not.toHaveBeenCalledWith(null);
  });

  it('clears the active preview on unmount', async () => {
    const { unmount } = render(
      <PreviewAttemptPage
        assessmentId={9}
        courseId={5}
        listingId={70}
        submissionId={42}
      />,
    );
    await screen.findByTestId('submission-edit');
    mockedSetActivePreview.mockClear();
    unmount();
    expect(mockedSetActivePreview).toHaveBeenCalledTimes(1);
    expect(mockedSetActivePreview).toHaveBeenCalledWith(null);
  });

  it('re-seeds the active preview when the ids change', async () => {
    const { rerender } = render(
      <PreviewAttemptPage
        assessmentId={9}
        courseId={5}
        listingId={70}
        submissionId={42}
      />,
    );
    await screen.findByTestId('submission-edit');
    mockedSetActivePreview.mockClear();
    rerender(
      <PreviewAttemptPage
        assessmentId={9}
        courseId={7}
        listingId={70}
        submissionId={42}
      />,
    );
    expect(mockedSetActivePreview).toHaveBeenNthCalledWith(1, null);
    expect(mockedSetActivePreview).toHaveBeenNthCalledWith(2, {
      courseId: 7,
      assessmentId: 9,
      submissionId: 42,
      isPreview: true,
    });
  });
});

describe('PreviewAttemptErrorElement', () => {
  it('clears the active preview scope on mount, closing the render-failure leak window (no cleanup effect would otherwise have registered)', async () => {
    render(<PreviewAttemptErrorElement />);
    await screen.findByText(/preview attempt/i);
    expect(mockedSetActivePreview).toHaveBeenCalledWith(null);
  });
});
