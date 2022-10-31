import actions from '../constants';

const initialState = {
  answers: {},
};

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.FETCH_SUBMISSION_SUCCESS:
    case actions.FINALISE_SUCCESS: {
      return {
        ...state,
        answers: {
          ...action.payload.answers.reduce(
            (obj, answer) => ({
              ...obj,
              [answer.fields.id]: answer.codaveriFeedback,
            }),
            {},
          ),
        },
      };
    }
    default:
      return state;
  }
}
