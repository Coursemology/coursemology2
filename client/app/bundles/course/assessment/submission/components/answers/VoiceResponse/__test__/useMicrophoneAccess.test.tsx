import { dispatch } from 'store';
import { renderHook } from 'test-utils';

import recorderHelper from '../../../../../utils/recorderHelper';
import actionTypes from '../../../../constants';
import useMicrophoneAccess from '../useMicrophoneAccess';

jest.mock('../../../../../utils/recorderHelper');

const helper = jest.mocked(recorderHelper);

const loadSubmission = (
  submission: { workflowState: string; isCreator: boolean },
  questionTypes: string[],
): void => {
  dispatch({
    type: actionTypes.FETCH_SUBMISSION_SUCCESS,
    payload: {
      submission: { ...submission, canGrade: false, graderView: false },
      assessment: {},
      annotations: [],
      posts: [],
      questions: questionTypes.map((type, index) => ({ id: index + 1, type })),
      topics: [],
      answers: [],
    },
  });
};

beforeEach(() => {
  dispatch({ type: 'PURGE_SUBMISSION_STORE' });
  helper.isRecordingSupported.mockReturnValue(true);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('useMicrophoneAccess', () => {
  it('asks for the mic when a student opens their own attempt, and releases it on leaving', async () => {
    loadSubmission({ workflowState: 'attempting', isCreator: true }, [
      'MultipleChoice',
      'VoiceResponse',
    ]);

    const { unmount } = await renderHook(() => useMicrophoneAccess());

    expect(helper.acquireMicrophone).toHaveBeenCalledTimes(1);
    expect(helper.releaseMicrophone).not.toHaveBeenCalled();

    unmount();

    expect(helper.releaseMicrophone).toHaveBeenCalledTimes(1);
  });

  it('does not ask a grader up front, but still releases a mic they acquired by recording', async () => {
    loadSubmission({ workflowState: 'attempting', isCreator: false }, [
      'VoiceResponse',
    ]);

    const { unmount } = await renderHook(() => useMicrophoneAccess());

    expect(helper.acquireMicrophone).not.toHaveBeenCalled();

    unmount();

    expect(helper.releaseMicrophone).toHaveBeenCalledTimes(1);
  });

  it('does not ask when the assessment has no voice question', async () => {
    loadSubmission({ workflowState: 'attempting', isCreator: true }, [
      'MultipleChoice',
    ]);

    await renderHook(() => useMicrophoneAccess());

    expect(helper.acquireMicrophone).not.toHaveBeenCalled();
  });

  it('does not ask once the submission is no longer being attempted', async () => {
    loadSubmission({ workflowState: 'submitted', isCreator: true }, [
      'VoiceResponse',
    ]);

    await renderHook(() => useMicrophoneAccess());

    expect(helper.acquireMicrophone).not.toHaveBeenCalled();
  });

  it('does not ask when the browser cannot record', async () => {
    helper.isRecordingSupported.mockReturnValue(false);
    loadSubmission({ workflowState: 'attempting', isCreator: true }, [
      'VoiceResponse',
    ]);

    await renderHook(() => useMicrophoneAccess());

    expect(helper.acquireMicrophone).not.toHaveBeenCalled();
  });
});
