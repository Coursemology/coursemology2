import actions from '../../constants';

export default function (state = {}, action) {
  switch (action.type) {
    case actions.GET_PAST_ANSWERS_SUCCESS: {
      return {
        ...state,
        ...action.payload.answers.reduce(
          (obj, answer) => ({
            ...obj,
            [answer.id]: {
              ...answer.fields,
              createdAt: answer.createdAt,
            },
          }),
          {}
        ),
      };
    }
    case actions.AUTOGRADE_SUCCESS: {
      const { latestAnswer } = action.payload;
      if (latestAnswer) {
        return {
          ...state,
          [latestAnswer.id]: {
            ...latestAnswer.fields,
            createdAt: latestAnswer.createdAt,
          },
        };
      }
      return state;
    }
    default:
      return state;
  }
}
