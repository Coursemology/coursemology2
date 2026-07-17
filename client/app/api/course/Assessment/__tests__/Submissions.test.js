import { createMockAdapter } from 'mocks/axiosMock';

import { setActivePreview } from 'course/marketplace/contexts/PreviewContext';

import AnswersAPI from '../Submission/Answer/Answer';
import ScribingAPI from '../Submission/Answer/Scribing';
import SubmissionsAPI from '../Submissions';

describe('SubmissionsAPI preview scoping', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/courses/5/assessments/9/submissions/42/edit');
  });

  afterEach(() => {
    setActivePreview(null);
    window.history.pushState({}, '', '/');
  });

  it('builds the preview url prefix when a preview scope is active', async () => {
    setActivePreview({
      courseId: 5,
      assessmentId: 9,
      submissionId: 42,
      isPreview: true,
    });
    const api = new SubmissionsAPI();
    const mock = createMockAdapter(api.client);
    const url = '/courses/5/marketplace/attempt';
    mock.onGet(url).reply(200, {});

    await api.index();

    expect(mock.history.get[0].url).toBe(url);
  });

  it('uses the active preview attempt id when updating a preview attempt', async () => {
    setActivePreview({
      courseId: 5,
      assessmentId: 9,
      submissionId: 42,
      isPreview: true,
    });
    const api = new SubmissionsAPI();
    const mock = createMockAdapter(api.client);
    const url = '/courses/5/marketplace/attempt/42';
    mock.onPatch(url).reply(200, {});

    await api.update(null, { submission: { finalise: true } });

    expect(mock.history.patch[0].url).toBe(url);
  });

  it('uses the active preview attempt id when generating feedback', async () => {
    setActivePreview({
      courseId: 5,
      assessmentId: 9,
      submissionId: 42,
      isPreview: true,
    });
    const api = new SubmissionsAPI();
    const mock = createMockAdapter(api.client);
    const url = '/courses/5/marketplace/attempt/42/generate_feedback';
    mock.onPost(url).reply(200, {});

    await api.generateFeedback(null, { answer_id: 100 });

    expect(mock.history.post[0].url).toBe(url);
  });

  it('uses the preview collection route for live feedback chat requests', async () => {
    setActivePreview({
      courseId: 5,
      assessmentId: 9,
      submissionId: 42,
      isPreview: true,
    });
    const api = new SubmissionsAPI();
    const mock = createMockAdapter(api.client);
    const url = '/courses/5/marketplace/attempt/fetch_live_feedback_chat';
    mock.onGet(url).reply(200, {});

    await api.fetchLiveFeedbackChat(100);

    expect(mock.history.get[0].url).toBe(url);
  });

  it('uses the preview collection route for saving live feedback', async () => {
    setActivePreview({
      courseId: 5,
      assessmentId: 9,
      submissionId: 42,
      isPreview: true,
    });
    const api = new SubmissionsAPI();
    const mock = createMockAdapter(api.client);
    const url = '/courses/5/marketplace/attempt/save_live_feedback';
    mock.onPost(url).reply(200, {});

    await api.saveLiveFeedback('thread-1', 'feedback', false);

    expect(mock.history.post[0].url).toBe(url);
  });

  it('falls back to the non-preview url prefix when no preview scope is active', async () => {
    const api = new SubmissionsAPI();
    const mock = createMockAdapter(api.client);
    const url = `/courses/${api.courseId}/assessments/${api.assessmentId}/submissions`;
    mock.onGet(url).reply(200, {});

    await api.index();

    expect(mock.history.get[0].url).toBe(url);
  });

  it('uses marketplace attempt routes when the preview scope has cleared but no assessment id exists', async () => {
    window.history.pushState({}, '', '/courses/5/marketplace/listings/7/attempt');
    const api = new SubmissionsAPI();
    const mock = createMockAdapter(api.client);
    const url = '/courses/5/marketplace/attempt/42/edit';
    mock.onGet(url).reply(200, {});

    await api.edit(42);

    expect(mock.history.get[0].url).toBe(url);
  });
});

describe('AnswersAPI preview scoping', () => {
  afterEach(() => setActivePreview(null));

  it('saves draft answers through the preview attempt update endpoint', async () => {
    setActivePreview({
      courseId: 5,
      assessmentId: 9,
      submissionId: 42,
      isPreview: true,
    });
    const api = new AnswersAPI();
    const mock = createMockAdapter(api.client);
    const url = '/courses/5/marketplace/attempt/42';
    mock.onPatch(url).reply(200, {
      answers: [{ id: 100, questionId: 7, optionIds: [1] }],
    });

    const response = await api.saveDraft(100, {
      answer: { id: 100, option_ids: [1] },
    });

    expect(mock.history.patch[0].url).toBe(url);
    expect(response.data).toEqual({ id: 100, questionId: 7, optionIds: [1] });
  });
});

describe('ScribingAPI preview scoping', () => {
  afterEach(() => setActivePreview(null));

  it('updates preview attempt scribbles through a preview-scoped endpoint', async () => {
    setActivePreview({
      courseId: 5,
      assessmentId: 9,
      submissionId: 42,
      isPreview: true,
    });
    const api = new ScribingAPI();
    const mock = createMockAdapter(api.client);
    const url = '/courses/5/marketplace/attempt/42/answers/100/scribing/scribbles';
    mock.onPost(url).reply(200, {});

    await api.update(100, { answer_id: 200, content: '{"objects":[]}' });

    expect(mock.history.post[0].url).toBe(url);
  });
});
