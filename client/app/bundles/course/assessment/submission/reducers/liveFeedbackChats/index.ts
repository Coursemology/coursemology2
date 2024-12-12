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
  AnswerFile,
  ChatSender,
  ChatShape,
  FeedbackLine,
  FeedbackShape,
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

const sampleSuggestions = (): Suggestion[] => {
  const suggestions = Object.values(suggestionsTranslations);
  const chosenSuggestions = shuffle(suggestions).slice(0, 3);

  return chosenSuggestions.map((suggestion) => {
    return {
      id: suggestion.id,
      defaultMessage: suggestion.defaultMessage,
    };
  });
};

const sortAndCombineFeedbacks = (
  numFeedbackFiles: number,
  answerFilename: string,
  feedbackLines: {
    path: string;
    annotation: FeedbackLine;
  }[],
): {
  path: string;
  line: number;
  content: string[];
}[] => {
  const processedFeedbackLines: {
    path: string;
    line: number;
    content: string[];
  }[] = Object.values(
    feedbackLines.reduce((acc, current) => {
      if (!acc[(current.path, current.annotation.line)]) {
        const path = numFeedbackFiles === 1 ? answerFilename : current.path;
        acc[(current.path, current.annotation.line)] = {
          path,
          line: current.annotation.line,
          content: [current.annotation.content],
        };
      } else {
        acc[(current.path, current.annotation.line)].content = [
          ...acc[(current.path, current.annotation.line)].content,
          current.annotation.content,
        ];
      }

      return acc;
    }, {}),
  );

  processedFeedbackLines
    .sort((f1, f2) => f1.line - f2.line)
    .sort((f1, f2) => f1.path.localeCompare(f2.path));

  return processedFeedbackLines;
};

const defaultValue = (answerId: number): LiveFeedbackChatData => {
  return {
    id: answerId,
    isLiveFeedbackChatOpen: false,
    isRequestingLiveFeedback: false,
    pendingFeedbackToken: null,
    liveFeedbackId: null,
    chats: [],
    answerFiles: [],
    suggestions: sampleSuggestions(),
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
              lineContent: null,
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
        const feedbackLines = feedbackFiles.flatMap((file) =>
          file.annotations.map((annotation) => ({
            path: file.path,
            annotation,
          })),
        );

        const sortedAndCombinedFeedbacks = sortAndCombineFeedbacks(
          feedbackFiles.length,
          liveFeedbackChats.answerFiles[0].filename,
          feedbackLines,
        );

        const answerLines = liveFeedbackChats.answerFiles.reduce(
          (acc, current) => {
            if (!acc[current.filename]) {
              acc[current.filename] = current.content.split('\n');
            }
            return acc;
          },
          {},
        );

        const newChats: ChatShape[] = sortedAndCombinedFeedbacks.map((line) => {
          return {
            sender: ChatSender.codaveri,
            lineNumber: line.line,
            lineContent: answerLines[line.path][line.line - 1].trim() ?? null,
            message: line.content,
            createdAt: moment(new Date()).format(SHORT_TIME_FORMAT),
            isError: false,
          };
        });

        const changes: Partial<LiveFeedbackChatData> = {
          isRequestingLiveFeedback: false,
          pendingFeedbackToken: null,
          chats: [...liveFeedbackChats.chats, ...newChats],
          suggestions: sampleSuggestions(),
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
          lineContent: null,
          message: [errorMessage],
          createdAt: moment(new Date()).format(SHORT_TIME_FORMAT),
          isError: true,
        };

        const changes: Partial<LiveFeedbackChatData> = {
          isRequestingLiveFeedback: false,
          pendingFeedbackToken: null,
          chats: [...liveFeedbackChats.chats, newChat],
          suggestions: sampleSuggestions(),
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
  updateAnswerFiles,
  sendPromptFromStudent,
  requestLiveFeedbackFromCodaveri,
  getLiveFeedbackFromCodaveri,
  getFailureFeedbackFromCodaveri,
} = liveFeedbackChatSlice.actions;

export default liveFeedbackChatSlice.reducer;
