import { createMockAdapter } from 'mocks/axiosMock';

import CourseAPI from 'api/course';

import { clearActivePreview, setActivePreview } from '../previewAttemptContext';

// The submission API reads the assessment id from window.location. Preview URLs have
// none, so the seam must fall back to preview routing even without the singleton.
const setPath = (path: string): void => {
  window.history.pushState({}, '', path);
};

const submissionsMock = createMockAdapter(
  CourseAPI.assessment.submissions.client,
);
const scribingMock = createMockAdapter(
  CourseAPI.assessment.answer.scribing.client,
);
const marketplaceMock = createMockAdapter(CourseAPI.marketplace.client);

beforeEach(() => {
  submissionsMock.reset();
  scribingMock.reset();
  marketplaceMock.reset();
  clearActivePreview();
});
afterEach(() => clearActivePreview());

describe('submission API preview routing', () => {
  it('routes edit to /assessments/:aid/submissions when NOT in preview', async () => {
    setPath(`/courses/${global.courseId}/assessments/9/submissions/5/edit`);
    submissionsMock
      .onGet(`/courses/${global.courseId}/assessments/9/submissions/5/edit`)
      .reply(200, {});

    await CourseAPI.assessment.submissions.edit(5);

    expect(submissionsMock.history.get[0].url).toBe(
      `/courses/${global.courseId}/assessments/9/submissions/5/edit`,
    );
  });

  it('routes edit to /marketplace/attempt when the singleton is set', async () => {
    setPath(`/courses/${global.courseId}/marketplace/attempt/5/edit`);
    setActivePreview(5);
    submissionsMock
      .onGet(`/courses/${global.courseId}/marketplace/attempt/5/edit`)
      .reply(200, {});

    await CourseAPI.assessment.submissions.edit(5);

    expect(submissionsMock.history.get[0].url).toBe(
      `/courses/${global.courseId}/marketplace/attempt/5/edit`,
    );
  });

  it('routes to /marketplace/attempt when assessment id is absent even if the singleton was cleared (stray poller)', async () => {
    setPath(`/courses/${global.courseId}/marketplace/attempt/5/edit`);
    clearActivePreview();
    submissionsMock
      .onGet(
        `/courses/${global.courseId}/marketplace/attempt/fetch_live_feedback_status`,
      )
      .reply(200, {});

    await CourseAPI.assessment.submissions.fetchLiveFeedbackStatus('t-1');

    // The critical assertion: it must NOT be /assessments/null/...
    expect(submissionsMock.history.get[0].url).toBe(
      `/courses/${global.courseId}/marketplace/attempt/fetch_live_feedback_status`,
    );
    expect(submissionsMock.history.get[0].url).not.toContain('assessments/null');
  });

  it('routes reset to /marketplace/attempt/:id/reset', async () => {
    setPath(`/courses/${global.courseId}/marketplace/attempt/5/edit`);
    setActivePreview(5);
    submissionsMock
      .onPost(`/courses/${global.courseId}/marketplace/attempt/5/reset`)
      .reply(200, {});

    await CourseAPI.assessment.submissions.reset(5);

    expect(submissionsMock.history.post[0].url).toBe(
      `/courses/${global.courseId}/marketplace/attempt/5/reset`,
    );
  });
});

describe('scribing API preview routing', () => {
  it('routes scribble update to /assessments/:aid/submissions/:sid/answers when NOT in preview', async () => {
    setPath(`/courses/${global.courseId}/assessments/9/submissions/5/edit`);
    scribingMock
      .onPost(
        `/courses/${global.courseId}/assessments/9/submissions/5/answers/7/scribing/scribbles`,
      )
      .reply(200, {});

    await CourseAPI.assessment.answer.scribing.update(7, {});

    expect(scribingMock.history.post[0].url).toBe(
      `/courses/${global.courseId}/assessments/9/submissions/5/answers/7/scribing/scribbles`,
    );
  });

  it('routes scribble update to /marketplace/attempt/:attemptId/answers when in preview', async () => {
    setPath(`/courses/${global.courseId}/marketplace/attempt/5/edit`);
    setActivePreview(5);
    scribingMock
      .onPost(
        `/courses/${global.courseId}/marketplace/attempt/5/answers/7/scribing/scribbles`,
      )
      .reply(200, {});

    await CourseAPI.assessment.answer.scribing.update(7, {});

    expect(scribingMock.history.post[0].url).toBe(
      `/courses/${global.courseId}/marketplace/attempt/5/answers/7/scribing/scribbles`,
    );
  });
});

describe('marketplace createAttempt', () => {
  it('posts to listings/:listingId/attempt and returns id + assessmentId', async () => {
    marketplaceMock
      .onPost(`/courses/${global.courseId}/marketplace/listings/7/attempt`)
      .reply(200, { id: 55, assessmentId: 9 });

    const response = await CourseAPI.marketplace.createAttempt(7);

    expect(marketplaceMock.history.post[0].url).toBe(
      `/courses/${global.courseId}/marketplace/listings/7/attempt`,
    );
    expect(response.data).toEqual({ id: 55, assessmentId: 9 });
  });
});
