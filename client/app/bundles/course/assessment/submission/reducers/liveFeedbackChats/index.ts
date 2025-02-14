import {
  createEntityAdapter,
  createSlice,
  type EntityState,
  PayloadAction,
} from '@reduxjs/toolkit';
import { shuffle } from 'lodash';
import moment from 'moment';

import { SHORT_TIME_FORMAT } from 'lib/moment';

import {
  getLocalStorageValue,
  modifyLocalStorageValue,
  setLocalStorageValue,
} from '../../localStorage/liveFeedbackChat/operations';
import {
  suggestionFixesTranslations,
  suggestionsTranslations,
} from '../../suggestionTranslations';
import {
  AnswerFile,
  ChatSender,
  ChatShape,
  LiveFeedbackChatData,
  Suggestion,
} from '../../types';

export const liveFeedbackChatAdapter =
  createEntityAdapter<LiveFeedbackChatData>({});

export interface LiveFeedbackChatState {
  liveFeedbackChatPerAnswer: EntityState<LiveFeedbackChatData>;
  liveFeedbackChatUrl: string;
}

const initialState: LiveFeedbackChatState = {
  liveFeedbackChatPerAnswer: liveFeedbackChatAdapter.getInitialState(),
  liveFeedbackChatUrl: '',
};

const sampleSuggestions = (
  isIncludingSuggestionFixes: boolean,
): Suggestion[] => {
  const suggestions = Object.values(suggestionsTranslations);
  const suggestionFixes = Object.values(suggestionFixesTranslations);

  const chosenSuggestions = isIncludingSuggestionFixes
    ? shuffle(suggestions)
        .slice(0, 2)
        .concat(shuffle(suggestionFixes).slice(0, 1))
    : shuffle(suggestions).slice(0, 3);

  return chosenSuggestions.map((suggestion) => {
    return {
      id: suggestion.id,
      defaultMessage: suggestion.defaultMessage,
    };
  });
};

const defaultValue = (answerId: number): LiveFeedbackChatData => {
  return {
    id: answerId,
    isLiveFeedbackChatOpen: false,
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
        const initialValue = getLocalStorageValue(answerId);

        if (!initialValue) {
          setLocalStorageValue(answerId, defaultValue(answerId));
        }

        liveFeedbackChatAdapter.setOne(
          state.liveFeedbackChatPerAnswer,
          initialValue ?? defaultValue(answerId),
        );
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

      modifyLocalStorageValue(answerId, changes);
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

      modifyLocalStorageValue(answerId, changes);
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

        modifyLocalStorageValue(answerId, changes);
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

      modifyLocalStorageValue(answerId, changes);
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

        modifyLocalStorageValue(answerId, changes);
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

        modifyLocalStorageValue(answerId, changes);
      }
    },
  },
});

export const {
  initiateLiveFeedbackChatPerQuestion,
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
