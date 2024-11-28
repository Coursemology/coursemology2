import { produce } from 'immer';
import { shuffle } from 'lodash';
import moment from 'moment/moment';

import {
  exceptionTranslations,
  suggestionsTranslations,
} from 'course/assessment/submission/translations';
import { Sender } from 'course/assessment/submission/types';
import { SHORT_DATE_TIME_FORMAT } from 'lib/moment';

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
  // TODO: Temporarily change to show no suggestions
  return shuffle(suggestionValues).slice(0, 0);
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

const groupFeedbackMessagesByLineNumber = (feedbackFile, isShowFileName) => {
  const groupedMessages = feedbackFile.feedbackLines
    .sort((a, b) => a.linenum - b.linenum)
    .reduce((acc, line) => {
      const newAcc = { ...acc };
      if (!newAcc[line.linenum]) {
        newAcc[line.linenum] = [];
      }
      newAcc[line.linenum].push(line.feedback);
      return newAcc;
    }, {});

  const messages = Object.entries(groupedMessages)
    .map(([linenum, texts], index, array) => {
      const lineMessages = [
        {
          texts,
          sender: Sender.Codaveri,
          linenum: Number(linenum),
          timestamp:
            index === array.length - 1
              ? moment(new Date()).format(SHORT_DATE_TIME_FORMAT)
              : null,
          isBold: false,
          bgColor: 'bg-gray-300',
        },
      ];

      lineMessages.unshift({
        texts: [`Line: ${linenum}`],
        sender: Sender.Codaveri,
        linenum: Number(linenum),
        isBold: true,
        bgColor: 'bg-gray-300',
      });

      return lineMessages;
    })
    .flat();

  return [
    ...(isShowFileName
      ? [
          {
            texts: `Filename: ${feedbackFile.path}`,
            sender: Sender.Codaveri,
            isBold: true,
          },
        ]
      : []),
    ...messages,
  ];
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
          ...groupFeedbackMessagesByLineNumber(
            feedbackFile,
            feedbackFiles.length > 1,
          ),
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
        const previousConversation = getConversation(draft, questionId);
        const errorMessage = {
          texts: [exceptionTranslations.requestError],
          sender: Sender.Codaveri,
          timestamp: moment(new Date()).format(SHORT_DATE_TIME_FORMAT),
          isBold: true,
          bgColor: 'bg-red-100',
        };
        const updatedConversation = [...previousConversation, errorMessage];
        updateFeedbackForQuestion(draft, questionId, {
          isRequestingLiveFeedback: false,
          pendingFeedbackToken: null,
          conversation: updatedConversation,
        });
      });
    }
    case actions.LIVE_FEEDBACK_USER_REQUEST: {
      const { questionId, answerId, userRequest } = action.payload;
      return produce(state, (draft) => {
        const previousConversation = getConversation(draft, questionId);
        const updatedConversation = [
          ...previousConversation,
          {
            texts: [userRequest],
            sender: Sender.Student,
            timestamp: moment(new Date()).format(SHORT_DATE_TIME_FORMAT),
            index: previousConversation.length,
            groupIndex: previousConversation.length,
            bgColor: 'bg-blue-100',
          },
        ];
        const focusedMessageIndex = previousConversation.length;
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
