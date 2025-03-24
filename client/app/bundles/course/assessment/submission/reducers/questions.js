import { arrayToObjectWithKey } from 'utilities/array';

import actions from '../constants';

export default function (state = {}, action) {
  switch (action.type) {
    case actions.FETCH_SUBMISSION_SUCCESS:
    case actions.FINALISE_SUCCESS:
    case actions.UNSUBMIT_SUCCESS:
    case actions.SAVE_ALL_GRADE_SUCCESS:
    case actions.SAVE_GRADE_SUCCESS:
    case actions.MARK_SUCCESS:
    case actions.UNMARK_SUCCESS:
    case actions.PUBLISH_SUCCESS: {
      const questionsWithAttemptsNum = action.payload.questions.map(
        (question) => {
          const answer = action.payload.answers.find(
            (a) => a.questionId === question.id,
          );
          return answer && answer.attemptsLeft !== undefined
            ? { ...question, attemptsLeft: answer.attemptsLeft }
            : question;
        },
      );
      return {
        ...state,
        ...arrayToObjectWithKey(questionsWithAttemptsNum, 'id'),
      };
    }
    case actions.SAVE_ANSWER_SUCCESS:
    case actions.REEVALUATE_SUCCESS:
    case actions.AUTOGRADE_SUCCESS:
    case actions.RESET_SUCCESS: {
      const { questionId } = action.payload;
      return {
        ...state,
        [questionId]: {
          ...state[questionId],
          answerId: action.payload.fields.id,
          attemptsLeft: action.payload.attemptsLeft,
        },
      };
    }
    default:
      return state;
  }
}
