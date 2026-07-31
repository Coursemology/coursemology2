import { dispatch } from 'store';
import { act, render, waitFor } from 'test-utils';
import { QuestionType } from 'types/course/assessment/question';
import { ScribingAnswerData } from 'types/course/assessment/submission/answer/scribing';

import ScribingView from 'course/assessment/submission/containers/ScribingView';
import { LOADING_INDICATOR_TEST_ID } from 'lib/components/core/LoadingIndicator';

import { scribingActions } from '../../../reducers/scribing';

/**
 * jsdom never actually fetches/decodes images, so a real <img>'s `load` event
 * never fires for a fake asset URL — ScribingCanvas's own image-load effect
 * (where it actually constructs the Fabric.js canvas) never runs under the
 * default Image. This stub returns a REAL HTMLImageElement (so Fabric/canvas's
 * `instanceof` checks on drawImage's source still pass), with `src` patched to
 * fire `load` asynchronously, like a real browser would.
 */
function StubImage(): HTMLImageElement {
  const img = document.createElement('img');
  Object.defineProperty(img, 'width', { value: 100, configurable: true });
  Object.defineProperty(img, 'height', { value: 100, configurable: true });
  let currentSrc = '';
  Object.defineProperty(img, 'src', {
    configurable: true,
    get: () => currentSrc,
    set: (value: string) => {
      currentSrc = value;
      setTimeout(() => img.dispatchEvent(new Event('load')), 0);
    },
  });
  return img;
}

const assessmentId = 1;
const submissionId = 2;
const answerId = 3;

const mockSubmission = {
  submission: {
    attemptedAt: '2017-05-11T15:38:11.000+08:00',
    basePoints: 1000,
    graderView: true,
    canUpdate: true,
    isCreator: false,
    late: false,
    maximumGrade: 70,
    pointsAwarded: null,
    submittedAt: '2017-05-11T17:02:17.000+08:00',
    submitter: { id: 10, name: 'Jane' },
    workflowState: 'submitted',
  },
  assessment: {},
  annotations: [],
  posts: [],
  questions: [{ id: 1, type: 'Scribing', maximumGrade: 5 }],
  topics: [],
  answers: [
    {
      id: answerId,
      fields: {
        id: answerId,
        questionId: 1,
      },
      grading: {
        grade: null,
        id: answerId,
      },
      questionId: 1,
      scribing_answer: {
        answer_id: 23,
        image_url: '/attachments/image1',
        scribbles: [],
        user_id: 10,
      },
      questionType: QuestionType.Scribing,
      createdAt: new Date(1494522137000).toISOString(),
      clientVersion: 1494522137000,
    } as ScribingAnswerData,
  ],
};

describe('ScribingView', () => {
  it('renders canvas', async () => {
    await act(() =>
      dispatch(scribingActions.initialize({ answers: mockSubmission.answers })),
    );

    const loaded = true;
    const url = `/courses/${global.courseId}/assessments/${assessmentId}/submissions/${submissionId}/edit`;

    await act(() =>
      dispatch(scribingActions.setCanvasLoaded({ answerId, loaded })),
    );

    const page = render(<ScribingView answerId={answerId} />, { at: [url] });

    expect(
      await page.findByTestId(`canvas-${answerId}`, {}, { timeout: 5000 }),
    ).toBeVisible();
  });

  describe('with a real Fabric.js canvas', () => {
    const OriginalImage = global.Image;

    beforeAll(() => {
      // @ts-expect-error — minimal stub, see StubImage above
      global.Image = StubImage;
    });

    afterAll(() => {
      global.Image = OriginalImage;
    });

    it('survives a redundant re-initialize after the canvas has already loaded', async () => {
      // React reports this crash as an uncaught commit-phase error (via a
      // dispatched DOM event), not as a rejected promise — `dispatch`/`act`
      // above it don't throw. Catch it directly so the test fails clearly
      // instead of just timing out waiting for a DOM update that never comes.
      const uncaughtErrors: string[] = [];
      const onWindowError = (event: ErrorEvent): void => {
        uncaughtErrors.push(event.error?.message ?? event.message);
      };
      window.addEventListener('error', onWindowError);

      try {
        await act(() =>
          dispatch(
            scribingActions.initialize({ answers: mockSubmission.answers }),
          ),
        );

        const url = `/courses/${global.courseId}/assessments/${assessmentId}/submissions/${submissionId}/edit`;
        const page = render(<ScribingView answerId={answerId} />, {
          at: [url],
        });

        // Wait for the component's own image-load effect to construct the real
        // Fabric.js canvas — this is what wraps the <canvas> in Fabric's own
        // container div, re-parenting it out from under React's tree.
        await waitFor(
          () =>
            expect(
              page.queryByTestId(LOADING_INDICATOR_TEST_ID),
            ).not.toBeInTheDocument(),
          { timeout: 5000 },
        );

        // A duplicate FETCH_SUBMISSION_SUCCESS re-runs scribing/initialize,
        // resetting isCanvasLoaded to false for an answer whose canvas Fabric.js
        // has already taken over. Toggling the loading indicator back on then
        // requires React to insertBefore a sibling relative to that
        // no-longer-direct-child <canvas> node — must not throw.
        await act(() =>
          dispatch(
            scribingActions.initialize({ answers: mockSubmission.answers }),
          ),
        );

        expect(uncaughtErrors).toEqual([]);
        expect(
          await page.findByTestId(
            LOADING_INDICATOR_TEST_ID,
            {},
            { timeout: 5000 },
          ),
        ).toBeVisible();
        expect(page.getByTestId(`canvas-${answerId}`)).toBeInTheDocument();
      } finally {
        window.removeEventListener('error', onWindowError);
      }
    });
  });
});
