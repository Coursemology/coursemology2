import { produce } from 'immer';

import actions from '../constants';

const initialState = {
  answers: {},
};

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.FETCH_SUBMISSION_SUCCESS:
    case actions.FINALISE_SUCCESS: {
      return produce(state, (draft) => {
        draft.answers = action.payload.answers.reduce(
          (reducerObject, answer) => {
            reducerObject[answer.fields.id] = answer.codaveriFeedback;
            return reducerObject;
          },
          {},
        );
      });
    }
    case actions.FEEDBACK_REQUEST: {
      const { answerId } = action;
      return produce(state, (draft) => {
        draft.answers[answerId] = {
          ...draft.answers[answerId],
          jobStatus: 'submitted',
        };
      });
    }
    case actions.FEEDBACK_FAILURE: {
      const { answerId } = action;
      return produce(state, (draft) => {
        draft.answers[answerId] = {
          ...draft.answers[answerId],
          jobStatus: 'errored',
        };
      });
    }
    case actions.FETCH_V2_SUBMITTED_FEEDBACK: {
      // const { answerId } = action;
      console.log(action);
      return state;
      // return produce(state, (draft) => {
      //   draft.answers[answerId] = {
      //     ...draft.answers[answerId],
      //     jobStatus: 'errored',
      //   };
      // });
    }
    default:
      return state;
  }
}
