import { produce } from 'immer';

import { suggestionsTranslations } from 'course/assessment/submission/translations';

import actions from '../constants';

export const LIVE_FEEDBACK_LOCAL_STORAGE_KEY = 'liveFeedbackStateLocalStorage';

const loadStateFromLocalStorage = () => {
  try {
    const serializedState = localStorage.getItem(
      LIVE_FEEDBACK_LOCAL_STORAGE_KEY,
    );
    return serializedState ? JSON.parse(serializedState) : undefined;
  } catch (error) {
    return undefined;
  }
};

const saveStateToLocalStorage = (state) => {
  const serializedState = JSON.stringify(state);
  localStorage.setItem(LIVE_FEEDBACK_LOCAL_STORAGE_KEY, serializedState);
};

const initialState = loadStateFromLocalStorage() || {
  feedbackUrl: null,
  feedbackByQuestion: {},
};

const getRandomSuggestions = () => {
  const suggestionValues = Object.values(suggestionsTranslations);
  const shuffled = suggestionValues.sort(() => 0.5 - Math.random());
  // TODO: Temporarily change to show no suggestions
  return shuffled.slice(0, 0);
};

const getOrDefault = (obj, paramKeys, defaultValue) => {
  const keys = Array.isArray(paramKeys) ? paramKeys : [paramKeys];
  return keys.reduce(
    (acc, key) => (acc && acc[key] !== undefined ? acc[key] : defaultValue),
    obj,
  );
};

const getConversation = (state, questionId) =>
  getOrDefault(state, ['feedbackByQuestion', questionId, 'conversation'], []);

const updateFeedbackForQuestion = (draft, questionId, newFeedbacks) => {
  draft.feedbackByQuestion[questionId] = {
    ...getOrDefault(draft.feedbackByQuestion, questionId, {}),
    ...newFeedbacks,
  };
  saveStateToLocalStorage(draft);
};

const liveFeedbackReducer = function (state = initialState, action) {
  switch (action.type) {
    case actions.LIVE_FEEDBACK_REQUEST: {
      const { token, questionId, liveFeedbackId, feedbackUrl } = action.payload;
      return produce(state, (draft) => {
        draft.feedbackUrl ??= feedbackUrl;
        const conversation = getConversation(draft, questionId);
        updateFeedbackForQuestion(draft, questionId, {
          isRequestingLiveFeedback: true,
          liveFeedbackId,
          pendingFeedbackToken: token,
          conversation,
          suggestedReplies: [],
          isDialogOpen: true,
        });
      });
    }
    case actions.LIVE_FEEDBACK_SUCCESS: {
      const { questionId, answerId, feedbackFiles } = action.payload;
      const newFeedbacks = feedbackFiles.reduce(
        (feedbackArr, feedbackFile) => [
          ...feedbackArr,
          ...(feedbackFiles.length > 1
            ? [
                {
                  text: `Filename: ${feedbackFile.path}`,
                  sender: 'Codaveri',
                  isBold: true,
                },
              ]
            : []),
          ...feedbackFile.feedbackLines
            .sort((a, b) => a.linenum - b.linenum)
            .map((line, index) => ({
              text: `Line ${line.linenum}: ${line.feedback}`,
              sender: 'Codaveri',
              linenum: line.linenum,
              timestamp:
                index === feedbackFile.feedbackLines.length - 1
                  ? new Date().toISOString()
                  : null,
              isBold: false,
            })),
        ],
        [],
      );
      return produce(state, (draft) => {
        const previousConversation = getConversation(draft, questionId);
        const newConversation = [...previousConversation, ...newFeedbacks];
        const suggestedReplies = getRandomSuggestions();
        const focusedMessageIndex = previousConversation.length;
        updateFeedbackForQuestion(draft, questionId, {
          isRequestingLiveFeedback: false,
          pendingFeedbackToken: null,
          answerId,
          conversation: newConversation,
          suggestedReplies,
          isDialogOpen: true,
          focusedMessageIndex,
        });
      });
    }
    case actions.LIVE_FEEDBACK_FAILURE: {
      const { questionId } = action.payload;
      return produce(state, (draft) => {
        updateFeedbackForQuestion(draft, questionId, {
          isRequestingLiveFeedback: false,
          pendingFeedbackToken: null,
        });
      });
    }
    case actions.LIVE_FEEDBACK_USER_REQUEST: {
      const { questionId, answerId, userRequest } = action.payload;
      return produce(state, (draft) => {
        const updatedConversation = [
          ...getConversation(draft, questionId),
          {
            text: userRequest,
            sender: 'Student',
            timestamp: new Date().toISOString(),
          },
        ];
        const focusedMessageIndex = updatedConversation.length - 1;
        updateFeedbackForQuestion(draft, questionId, {
          isRequestingLiveFeedback: true,
          pendingFeedbackToken: null,
          answerId,
          conversation: updatedConversation,
          suggestedReplies: [],
          isDialogOpen: true,
          focusedMessageIndex,
        });
      });
    }
    case actions.LIVE_FEEDBACK_OPEN_POPUP: {
      const { questionId, isDialogOpen } = action.payload;
      return produce(state, (draft) => {
        const localStorageState = loadStateFromLocalStorage();
        const conversation = getOrDefault(
          localStorageState,
          ['feedbackByQuestion', questionId, 'conversation'],
          [],
        );
        const suggestedReplies = getRandomSuggestions();
        updateFeedbackForQuestion(draft, questionId, {
          isDialogOpen,
          conversation,
          suggestedReplies,
        });
      });
    }
    default:
      return state;
  }
};

export default liveFeedbackReducer;
