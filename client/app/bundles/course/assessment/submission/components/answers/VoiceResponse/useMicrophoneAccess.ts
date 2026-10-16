import { useEffect } from 'react';

import { useAppSelector } from 'lib/hooks/store';

import recorderHelper from '../../../../utils/recorderHelper';
import { questionTypes, workflowStates } from '../../../constants';
import { getQuestions } from '../../../selectors/questions';
import { getSubmission } from '../../../selectors/submissions';

/**
 * Asks for the mic once, when the submission page opens, so that recording never prompts mid-answer.
 * Only the student attempting their own submission is asked up front. A grader opening an in-progress
 * submission sees the record buttons too, but is asked only if they press one.
 *
 * Either way, the mic is released when the page closes.
 */
const useMicrophoneAccess = (): void => {
  const isAttemptingOwnSubmission = useAppSelector(
    (state) =>
      getSubmission(state).workflowState === workflowStates.Attempting &&
      getSubmission(state).isCreator,
  );
  const hasVoiceQuestion = useAppSelector((state) =>
    Object.values(getQuestions(state)).some(
      (question) => question.type === questionTypes.VoiceResponse,
    ),
  );
  const enabled = isAttemptingOwnSubmission && hasVoiceQuestion;

  useEffect(() => {
    if (enabled && recorderHelper.isRecordingSupported())
      recorderHelper.acquireMicrophone();

    // Unconditional: a mic acquired on demand by pressing Start must be let go of too. Releasing when
    // nothing is held does nothing.
    return recorderHelper.releaseMicrophone;
  }, [enabled]);
};

export default useMicrophoneAccess;
