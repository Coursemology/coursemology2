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
import { suggestionsTranslations } from '../../suggestionTranslations';
import {
  ChatSender,
  ChatShape,
  FeedbackShape,
  LiveFeedbackChatData,
  Suggestion,
} from '../../types';

export const liveFeedbackChatAdapter =
  createEntityAdapter<LiveFeedbackChatData>({});

export interface LiveFeedbackChatState {
  liveFeedbackChatPerQuestion: EntityState<LiveFeedbackChatData>;
  liveFeedbackChatUrl: string;
}

const initialState: LiveFeedbackChatState = {
  liveFeedbackChatPerQuestion: liveFeedbackChatAdapter.getInitialState(),
  liveFeedbackChatUrl: '',
};

const generateSuggestion = (): Suggestion[] => {
  const suggestions = Object.values(suggestionsTranslations);
  const chosenSuggestions = shuffle(suggestions).slice(0, 3);

  return chosenSuggestions.map((suggestion) => {
    return {
      id: suggestion.id,
      defaultMessage: suggestion.defaultMessage,
    };
  });
};

const defaultValue = (questionId: string | number): LiveFeedbackChatData => {
  return {
    id: questionId,
    isLiveFeedbackChatOpen: false,
    isRequestingLiveFeedback: false,
    pendingFeedbackToken: null,
    liveFeedbackId: null,
    chats: [],
    suggestions: generateSuggestion(),
  };
};

export const liveFeedbackChatSlice = createSlice({
  name: 'liveFeedbackChats',
  initialState,
  reducers: {
    initiateLiveFeedbackChatPerQuestion: (
      state,
      action: PayloadAction<{
        submissionId: string | null;
        questions: { id: string | number }[];
      }>,
    ) => {
      const { submissionId, questions } = action.payload;
      liveFeedbackChatAdapter.removeAll(state.liveFeedbackChatPerQuestion);
      questions.forEach((question) => {
        const initialValue = getLocalStorageValue(question.id, submissionId);

        if (!initialValue) {
          setLocalStorageValue(
            question.id,
            defaultValue(question.id),
            submissionId,
          );
        }

        liveFeedbackChatAdapter.setOne(
          state.liveFeedbackChatPerQuestion,
          initialValue ?? defaultValue(question.id),
        );
      });
    },
    openLiveFeedbackChat: (
      state,
      action: PayloadAction<{
        submissionId: string | null;
        questionId: number;
      }>,
    ) => {
      const { submissionId, questionId } = action.payload;
      const changes: Partial<LiveFeedbackChatData> = {
        isLiveFeedbackChatOpen: true,
      };
      liveFeedbackChatAdapter.updateOne(state.liveFeedbackChatPerQuestion, {
        id: questionId,
        changes,
      });

      modifyLocalStorageValue(questionId, changes, submissionId);
    },
    closeLiveFeedbackChat: (
      state,
      action: PayloadAction<{
        submissionId: string | null;
        questionId: number;
      }>,
    ) => {
      const { submissionId, questionId } = action.payload;
      const changes: Partial<LiveFeedbackChatData> = {
        isLiveFeedbackChatOpen: false,
      };
      liveFeedbackChatAdapter.updateOne(state.liveFeedbackChatPerQuestion, {
        id: questionId,
        changes,
      });

      modifyLocalStorageValue(questionId, changes, submissionId);
    },
    sendPromptFromStudent: (
      state,
      action: PayloadAction<{
        submissionId: string | null;
        questionId: string | number;
        message: string;
      }>,
    ) => {
      const { submissionId, questionId, message } = action.payload;
      const liveFeedbackChats =
        state.liveFeedbackChatPerQuestion.entities[questionId];
      const currentTime = moment(new Date()).format(SHORT_TIME_FORMAT);

      if (liveFeedbackChats) {
        const changes: Partial<LiveFeedbackChatData> = {
          isRequestingLiveFeedback: true,
          chats: [
            ...liveFeedbackChats.chats,
            {
              sender: ChatSender.student,
              lineNumber: null,
              message: [message],
              createdAt: currentTime,
              isError: false,
            },
          ],
        };
        liveFeedbackChatAdapter.updateOne(state.liveFeedbackChatPerQuestion, {
          id: questionId,
          changes,
        });

        modifyLocalStorageValue(questionId, changes, submissionId);
      }
    },
    requestLiveFeedbackFromCodaveri: (
      state,
      action: PayloadAction<{
        submissionId: string | null;
        token: string;
        questionId: number;
        liveFeedbackId: number;
        feedbackUrl: string;
      }>,
    ) => {
      const { submissionId, token, questionId, liveFeedbackId, feedbackUrl } =
        action.payload;
      state.liveFeedbackChatUrl = feedbackUrl;

      const changes: Partial<LiveFeedbackChatData> = {
        isRequestingLiveFeedback: true,
        liveFeedbackId,
        pendingFeedbackToken: token,
      };

      liveFeedbackChatAdapter.updateOne(state.liveFeedbackChatPerQuestion, {
        id: questionId,
        changes,
      });

      modifyLocalStorageValue(questionId, changes, submissionId);
    },
    getLiveFeedbackFromCodaveri: (
      state,
      action: PayloadAction<{
        submissionId: string | null;
        questionId: string | number;
        feedbackFiles: FeedbackShape[];
      }>,
    ) => {
      const { submissionId, questionId, feedbackFiles } = action.payload;
      const liveFeedbackChats =
        state.liveFeedbackChatPerQuestion.entities[questionId];

      if (liveFeedbackChats) {
        const feedbackLines = feedbackFiles.flatMap(
          (file) => file.feedbackLines,
        );

        const sortedAndCombinedFeedbacks: {
          linenum: number;
          feedback: string[];
        }[] = Object.values(
          feedbackLines.reduce((acc, current) => {
            if (!acc[current.linenum]) {
              acc[current.linenum] = {
                linenum: current.linenum,
                feedback: [current.feedback],
              };
            } else {
              acc[current.linenum].feedback = [
                ...acc[current.linenum].feedback,
                current.feedback,
              ];
            }

            return acc;
          }, {}),
        );

        sortedAndCombinedFeedbacks.sort((f1, f2) => f1.linenum - f2.linenum);

        const newChats: ChatShape[] = sortedAndCombinedFeedbacks.map((line) => {
          return {
            sender: ChatSender.codaveri,
            lineNumber: line.linenum,
            message: line.feedback,
            createdAt: moment(new Date()).format(SHORT_TIME_FORMAT),
            isError: false,
          };
        });

        const changes: Partial<LiveFeedbackChatData> = {
          isRequestingLiveFeedback: false,
          pendingFeedbackToken: null,
          chats: [...liveFeedbackChats.chats, ...newChats],
          suggestions: generateSuggestion(),
        };

        liveFeedbackChatAdapter.updateOne(state.liveFeedbackChatPerQuestion, {
          id: questionId,
          changes,
        });

        modifyLocalStorageValue(questionId, changes, submissionId);
      }
    },
    getFailureFeedbackFromCodaveri: (
      state,
      action: PayloadAction<{
        submissionId: string | null;
        questionId: number;
        errorMessage: string;
      }>,
    ) => {
      const { submissionId, questionId, errorMessage } = action.payload;
      const liveFeedbackChats =
        state.liveFeedbackChatPerQuestion.entities[questionId];

      if (liveFeedbackChats) {
        const newChat: ChatShape = {
          sender: ChatSender.codaveri,
          lineNumber: null,
          message: [errorMessage],
          createdAt: moment(new Date()).format(SHORT_TIME_FORMAT),
          isError: true,
        };

        const changes: Partial<LiveFeedbackChatData> = {
          isRequestingLiveFeedback: false,
          pendingFeedbackToken: null,
          chats: [...liveFeedbackChats.chats, newChat],
          suggestions: generateSuggestion(),
        };

        liveFeedbackChatAdapter.updateOne(state.liveFeedbackChatPerQuestion, {
          id: questionId,
          changes,
        });

        modifyLocalStorageValue(questionId, changes, submissionId);
      }
    },
  },
});

export const {
  initiateLiveFeedbackChatPerQuestion,
  openLiveFeedbackChat,
  closeLiveFeedbackChat,
  sendPromptFromStudent,
  requestLiveFeedbackFromCodaveri,
  getLiveFeedbackFromCodaveri,
  getFailureFeedbackFromCodaveri,
} = liveFeedbackChatSlice.actions;

export default liveFeedbackChatSlice.reducer;
