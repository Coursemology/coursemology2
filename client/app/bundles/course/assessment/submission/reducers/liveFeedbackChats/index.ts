import {
  createEntityAdapter,
  createSlice,
  type EntityState,
  PayloadAction,
} from '@reduxjs/toolkit';
import { shuffle } from 'lodash';

import moment, { SHORT_TIME_FORMAT } from 'lib/moment';

import {
  getLocalStorageValue,
  modifyLocalStorageValue,
  setLocalStorageValue,
} from '../../localStorage/liveFeedbackChat/operations';
import {
  suggestionFixesMapping,
  suggestionMapping,
} from '../../suggestionTranslations';
import {
  AnswerFile,
  ChatSender,
  ChatShape,
  LiveFeedbackChatData,
  LiveFeedbackLocalStorage,
  LiveFeedbackThread,
  Suggestion,
} from '../../types';

export const liveFeedbackChatAdapter =
  createEntityAdapter<LiveFeedbackChatData>({});

export interface LiveFeedbackChatState {
  liveFeedbackChatPerAnswer: EntityState<LiveFeedbackChatData>;
  liveFeedbackChatUrl: string | null;
}

const initialState: LiveFeedbackChatState = {
  liveFeedbackChatPerAnswer: liveFeedbackChatAdapter.getInitialState(),
  liveFeedbackChatUrl: '',
};

const sampleSuggestions = (
  isIncludingSuggestionFixes: boolean,
): Suggestion[] => {
  const suggestionIndexes = Object.keys(suggestionMapping);
  const suggestionFixIndexes = Object.keys(suggestionFixesMapping);

  const chosenSuggestionIndexes = isIncludingSuggestionFixes
    ? shuffle(suggestionIndexes)
        .slice(0, 2)
        .concat(shuffle(suggestionFixIndexes).slice(0, 1))
    : shuffle(suggestionIndexes).slice(0, 3);

  return chosenSuggestionIndexes.map((index) => {
    const suggestionIndex = Number(index);
    const suggestion =
      suggestionMapping[suggestionIndex] ??
      suggestionFixesMapping[suggestionIndex];
    return {
      id: suggestion.id,
      index: suggestionIndex,
      defaultMessage: suggestion.defaultMessage,
    };
  });
};

const defaultValue = (answerId: number): LiveFeedbackChatData => {
  return {
    id: answerId,
    isLiveFeedbackChatOpen: false,
    isLiveFeedbackChatLoaded: false,
    isRequestingLiveFeedback: false,
    pendingFeedbackToken: null,
    liveFeedbackId: null,
    currentThreadId: null,
    isCurrentThreadExpired: false,
    chats: [],
    answerFiles: [],
    suggestions: sampleSuggestions(false),
  };
};

const initialLocalStorageValue: LiveFeedbackLocalStorage = {
  isLiveFeedbackChatOpen: false,
  isRequestingLiveFeedback: false,
  pendingFeedbackToken: null,
  feedbackUrl: null,
};

export const liveFeedbackChatSlice = createSlice({
  name: 'liveFeedbackChats',
  initialState,
  reducers: {
    initiateLiveFeedbackChatPerQuestion: (
      state,
      action: PayloadAction<{
        answerIds: number[];
      }>,
    ) => {
      const { answerIds } = action.payload;
      liveFeedbackChatAdapter.removeAll(state.liveFeedbackChatPerAnswer);

      answerIds.forEach((answerId) => {
        const localStorageValue = getLocalStorageValue(answerId);

        if (!localStorageValue) {
          setLocalStorageValue(answerId, initialLocalStorageValue);
        }

        liveFeedbackChatAdapter.setOne(
          state.liveFeedbackChatPerAnswer,
          localStorageValue
            ? { ...defaultValue(answerId), ...localStorageValue }
            : defaultValue(answerId),
        );

        state.liveFeedbackChatUrl = localStorageValue?.feedbackUrl ?? null;
      });
    },
    storeInitialLiveFeedbackChats: (
      state,
      action: PayloadAction<{ thread: LiveFeedbackThread }>,
    ) => {
      const { thread } = action.payload;
      const changes: Partial<LiveFeedbackChatData> = {
        isLiveFeedbackChatLoaded: true,
        currentThreadId: thread.threadId,
        chats: thread.messages.map((message) => {
          const createdAt = moment(new Date(message.createdAt)).format(
            SHORT_TIME_FORMAT,
          );
          return {
            sender:
              message.creatorId === 0
                ? ChatSender.codaveri
                : ChatSender.student,
            message: message.content,
            createdAt,
            isError: message.isError,
          };
        }),
      };

      liveFeedbackChatAdapter.updateOne(state.liveFeedbackChatPerAnswer, {
        id: thread.answerId,
        changes,
      });
    },
    resetLiveFeedbackChat: (
      state,
      action: PayloadAction<{
        answerId: number;
      }>,
    ) => {
      const { answerId } = action.payload;
      const changes: Partial<LiveFeedbackChatData> = {
        isRequestingLiveFeedback: false,
        pendingFeedbackToken: null,
        liveFeedbackId: null,
        currentThreadId: null,
        isCurrentThreadExpired: false,
        chats: [],
      };

      liveFeedbackChatAdapter.updateOne(state.liveFeedbackChatPerAnswer, {
        id: answerId,
        changes,
      });

      const localStorageValueChanges: Partial<LiveFeedbackLocalStorage> = {
        isRequestingLiveFeedback: false,
        pendingFeedbackToken: null,
      };

      modifyLocalStorageValue(answerId, localStorageValueChanges);
    },
    toggleLiveFeedbackChat: (
      state,
      action: PayloadAction<{
        answerId: number;
      }>,
    ) => {
      const { answerId } = action.payload;
      const isChatOpen =
        state.liveFeedbackChatPerAnswer.entities[answerId]
          ?.isLiveFeedbackChatOpen ?? false;
      const changes: Partial<LiveFeedbackChatData> = {
        isLiveFeedbackChatOpen: !isChatOpen,
      };
      liveFeedbackChatAdapter.updateOne(state.liveFeedbackChatPerAnswer, {
        id: answerId,
        changes,
      });

      const localStorageValueChanges: Partial<LiveFeedbackLocalStorage> = {
        isLiveFeedbackChatOpen: !isChatOpen,
      };

      modifyLocalStorageValue(answerId, localStorageValueChanges);
    },
    updateAnswerFiles: (
      state,
      action: PayloadAction<{
        answerId: number;
        answerFiles: AnswerFile[];
      }>,
    ) => {
      const { answerId, answerFiles } = action.payload;
      const changes: Partial<LiveFeedbackChatData> = {
        answerFiles,
      };
      liveFeedbackChatAdapter.updateOne(state.liveFeedbackChatPerAnswer, {
        id: answerId,
        changes,
      });

      modifyLocalStorageValue(answerId, changes);
    },
    updateLiveFeedbackChatStatus: (
      state,
      action: PayloadAction<{
        answerId: number;
        threadId: string;
        isThreadExpired: boolean;
      }>,
    ) => {
      const { answerId, threadId, isThreadExpired } = action.payload;
      const changes: Partial<LiveFeedbackChatData> = {
        currentThreadId: threadId,
        isCurrentThreadExpired: isThreadExpired,
      };
      liveFeedbackChatAdapter.updateOne(state.liveFeedbackChatPerAnswer, {
        id: answerId,
        changes,
      });

      modifyLocalStorageValue(answerId, changes);
    },
    sendPromptFromStudent: (
      state,
      action: PayloadAction<{
        answerId: number;
        message: string;
      }>,
    ) => {
      const { answerId, message } = action.payload;
      const liveFeedbackChats =
        state.liveFeedbackChatPerAnswer.entities[answerId];
      const currentTime = moment(new Date()).format(SHORT_TIME_FORMAT);

      if (liveFeedbackChats) {
        const changes: Partial<LiveFeedbackChatData> = {
          isRequestingLiveFeedback: true,
          chats: [
            ...liveFeedbackChats.chats,
            {
              sender: ChatSender.student,
              message,
              createdAt: currentTime,
              isError: false,
            },
          ],
        };
        liveFeedbackChatAdapter.updateOne(state.liveFeedbackChatPerAnswer, {
          id: answerId,
          changes,
        });

        const localStorageValueChanges: Partial<LiveFeedbackLocalStorage> = {
          isRequestingLiveFeedback: true,
        };

        modifyLocalStorageValue(answerId, localStorageValueChanges);
      }
    },
    requestLiveFeedbackFromCodaveri: (
      state,
      action: PayloadAction<{
        token: string;
        answerId: number;
        feedbackUrl: string;
        liveFeedbackId: number;
      }>,
    ) => {
      const { token, answerId, liveFeedbackId, feedbackUrl } = action.payload;
      state.liveFeedbackChatUrl = feedbackUrl;

      const changes: Partial<LiveFeedbackChatData> = {
        isRequestingLiveFeedback: true,
        liveFeedbackId,
        pendingFeedbackToken: token,
      };

      liveFeedbackChatAdapter.updateOne(state.liveFeedbackChatPerAnswer, {
        id: answerId,
        changes,
      });

      const localStorageValueChanges: Partial<LiveFeedbackLocalStorage> = {
        isRequestingLiveFeedback: true,
        pendingFeedbackToken: token,
        feedbackUrl,
      };

      modifyLocalStorageValue(answerId, localStorageValueChanges);
    },
    getLiveFeedbackFromCodaveri: (
      state,
      action: PayloadAction<{
        answerId: number;
        overallContent: string | null;
      }>,
    ) => {
      const { answerId, overallContent } = action.payload;
      const liveFeedbackChats =
        state.liveFeedbackChatPerAnswer.entities[answerId];

      if (liveFeedbackChats) {
        const summaryChat: ChatShape[] = overallContent
          ? [
              {
                sender: ChatSender.codaveri,
                message: overallContent,
                createdAt: moment(new Date()).format(SHORT_TIME_FORMAT),
                isError: false,
              },
            ]
          : [];

        const changes: Partial<LiveFeedbackChatData> = {
          isRequestingLiveFeedback: false,
          pendingFeedbackToken: null,
          chats: [...liveFeedbackChats.chats, ...summaryChat],
          suggestions: sampleSuggestions(true),
        };

        liveFeedbackChatAdapter.updateOne(state.liveFeedbackChatPerAnswer, {
          id: answerId,
          changes,
        });

        const localStorageValueChanges: Partial<LiveFeedbackLocalStorage> = {
          isRequestingLiveFeedback: false,
          pendingFeedbackToken: null,
        };

        modifyLocalStorageValue(answerId, localStorageValueChanges);
      }
    },
    getFailureFeedbackFromCodaveri: (
      state,
      action: PayloadAction<{
        answerId: number;
        errorMessage: string;
      }>,
    ) => {
      const { answerId, errorMessage } = action.payload;
      const liveFeedbackChats =
        state.liveFeedbackChatPerAnswer.entities[answerId];

      if (liveFeedbackChats) {
        const newChat: ChatShape = {
          sender: ChatSender.codaveri,
          message: errorMessage,
          createdAt: moment(new Date()).format(SHORT_TIME_FORMAT),
          isError: true,
        };

        const changes: Partial<LiveFeedbackChatData> = {
          isRequestingLiveFeedback: false,
          pendingFeedbackToken: null,
          chats: [...liveFeedbackChats.chats, newChat],
          suggestions: sampleSuggestions(true),
        };

        liveFeedbackChatAdapter.updateOne(state.liveFeedbackChatPerAnswer, {
          id: answerId,
          changes,
        });

        const localStorageValueChanges: Partial<LiveFeedbackLocalStorage> = {
          isRequestingLiveFeedback: false,
          pendingFeedbackToken: null,
        };

        modifyLocalStorageValue(answerId, localStorageValueChanges);
      }
    },
  },
});

export const {
  initiateLiveFeedbackChatPerQuestion,
  storeInitialLiveFeedbackChats,
  toggleLiveFeedbackChat,
  resetLiveFeedbackChat,
  updateAnswerFiles,
  updateLiveFeedbackChatStatus,
  sendPromptFromStudent,
  requestLiveFeedbackFromCodaveri,
  getLiveFeedbackFromCodaveri,
  getFailureFeedbackFromCodaveri,
} = liveFeedbackChatSlice.actions;

export default liveFeedbackChatSlice.reducer;
