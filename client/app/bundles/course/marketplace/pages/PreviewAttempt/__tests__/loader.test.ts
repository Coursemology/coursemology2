import { LoaderFunctionArgs } from 'react-router-dom';
import { createMockAdapter } from 'mocks/axiosMock';

import CourseAPI from 'api/course';
import { setActivePreview } from 'course/marketplace/contexts/PreviewContext';

import { previewAttemptLoader } from '../loader';

// Keep the real module (so `previewAttemptLoader` calls the real `setActivePreview` under
// test), but spy on `setActivePreview` itself — the loader seeding PreviewContext eagerly
// (before this promise even resolves) IS its contract: see loader.ts for why that timing
// matters beyond the page's own mount effect.
jest.mock('course/marketplace/contexts/PreviewContext', () => ({
  ...jest.requireActual('course/marketplace/contexts/PreviewContext'),
  setActivePreview: jest.fn(),
}));

const mockedSetActivePreview = setActivePreview as jest.Mock;

const mock = createMockAdapter(CourseAPI.marketplace.client);

// A never-aborted signal, for the "happy path" tests below — they exist to prove the
// *aborted* case (further down) is actually gated on this, not just always skipped.
const liveRequest = { signal: new AbortController().signal };

beforeEach(() => {
  mock.reset();
  mockedSetActivePreview.mockClear();
});

describe('previewAttemptLoader', () => {
  it('creates/resumes the preview attempt and returns the ids the route seeds into the page', async () => {
    const url = `/courses/${global.courseId}/marketplace/listings/3/attempt`;
    mock.onPost(url).reply(200, { id: 42, assessmentId: 9 });

    const result = await previewAttemptLoader()({
      params: { courseId: global.courseId.toString(), listingId: '3' },
      request: liveRequest,
    } as unknown as LoaderFunctionArgs);

    expect(result).toEqual({
      courseId: Number(global.courseId),
      assessmentId: 9,
      submissionId: 42,
      listingId: 3,
    });
  });

  it('seeds PreviewContext with the exact ids (so the very first submission fetch, dispatched synchronously on mount, already sees the preview scope)', async () => {
    const url = `/courses/${global.courseId}/marketplace/listings/3/attempt`;
    mock.onPost(url).reply(200, { id: 42, assessmentId: 9 });

    await previewAttemptLoader()({
      params: { courseId: global.courseId.toString(), listingId: '3' },
      request: liveRequest,
    } as unknown as LoaderFunctionArgs);

    expect(mockedSetActivePreview).toHaveBeenCalledWith({
      courseId: Number(global.courseId),
      assessmentId: 9,
      submissionId: 42,
      isPreview: true,
    });
  });

  it('does not seed PreviewContext when the navigation was superseded (request aborted) before the POST resolved', async () => {
    // e.g. the user navigated away while the create/resume POST was still in flight: the
    // promise still resolves and this loader function still runs to completion (there is no
    // way to cancel it mid-flight), but React Router will never mount the route element for an
    // aborted navigation — so no cleanup effect ever registers to null the scope back out.
    // Skipping the set here (rather than setting-then-relying-on-a-cleanup-that-never-runs) is
    // what closes that leak window.
    const url = `/courses/${global.courseId}/marketplace/listings/3/attempt`;
    mock.onPost(url).reply(200, { id: 42, assessmentId: 9 });

    const controller = new AbortController();
    controller.abort();

    await previewAttemptLoader()({
      params: { courseId: global.courseId.toString(), listingId: '3' },
      request: { signal: controller.signal },
    } as unknown as LoaderFunctionArgs);

    expect(mockedSetActivePreview).not.toHaveBeenCalled();
  });
});
