import actions from '../../constants';

export default function(state = {}, action) {
  switch (action.type) {
    case actions.GET_PAST_ANSWERS_SUCCESS: {
      return {
        ...state,
        ...action.payload.answers.reduce(
          (obj, answer) => ({
            ...obj,
            [answer.id]: answer.testCases,
          }),
          {},
        ),
      };
    }
    case actions.AUTOGRADE_SUCCESS: {
      const { latestAnswer } = action.payload;
      if (latestAnswer) {
        return {
          ...state,
          [latestAnswer.id]: latestAnswer.testCases,
        };
      }
      return state;
    }
    default:
      return state;
  }
}
