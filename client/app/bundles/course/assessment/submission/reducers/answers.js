import actions from '../constants';

export default function (state = {}, action) {
  switch (action.type) {
    case actions.FETCH_SUBMISSION_SUCCESS:
    case actions.SAVE_DRAFT_SUCCESS:
    case actions.SUBMISSION_SUCCESS:
    case actions.UNSUBMIT_SUCCESS:
    case actions.MARK_SUCCESS:
    case actions.PUBLISH_SUCCESS:
      return {
        ...state,
        ...action.payload.answers.reduce((obj, answer) =>
          ({
            ...obj,
            [answer.fields.id]: answer.fields,
          })
        , {}),
      };
    case actions.AUTOGRADE_SUCCESS: {
      const { questionId, fields: { id } } = action.payload;
      return Object.keys(state).reduce((obj, key) => {
        if (state[key].questionId !== questionId) {
          return { ...obj, [key]: state[key] };
        }
        return obj;
      }, { [id]: action.payload.fields });
    }
    default:
      return state;
  }
}
