import {
  createEntityAdapter,
  createSlice,
  type EntityState,
  PayloadAction,
} from '@reduxjs/toolkit';
import moment from 'moment';

import { SHORT_TIME_FORMAT } from 'lib/moment';

import {
  getLocalStorageValue,
  modifyLocalStorageValue,
  setLocalStorageValue,
} from '../../localStorage/liveFeedbackChat/operations';
import {
  ChatSender,
  ChatShape,
  FeedbackShape,
  LiveFeedbackChatData,
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

const defaultValue = (answerId: number): LiveFeedbackChatData => {
  return {
    id: answerId,
    isLiveFeedbackChatOpen: false,
    isRequestingLiveFeedback: false,
    pendingFeedbackToken: null,
    liveFeedbackId: null,
    chats: [],
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
              lineNumber: null,
              message: [message],
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
        liveFeedbackId: number;
        feedbackUrl: string;
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
        feedbackFiles: FeedbackShape[];
      }>,
    ) => {
      const { answerId, feedbackFiles } = action.payload;
      const liveFeedbackChats =
        state.liveFeedbackChatPerAnswer.entities[answerId];

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
          lineNumber: null,
          message: [errorMessage],
          createdAt: moment(new Date()).format(SHORT_TIME_FORMAT),
          isError: true,
        };

        const changes: Partial<LiveFeedbackChatData> = {
          isRequestingLiveFeedback: false,
          pendingFeedbackToken: null,
          chats: [...liveFeedbackChats.chats, newChat],
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
  sendPromptFromStudent,
  requestLiveFeedbackFromCodaveri,
  getLiveFeedbackFromCodaveri,
  getFailureFeedbackFromCodaveri,
} = liveFeedbackChatSlice.actions;

export default liveFeedbackChatSlice.reducer;
