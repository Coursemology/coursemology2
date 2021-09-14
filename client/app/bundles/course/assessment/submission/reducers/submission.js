/* eslint-disable no-case-declarations */
import actions from '../constants';

/**
 * Calculate the `graderView` value based on the old state and the canGrade value fetched from server.
 */
function calculateGraderView(state, canGrade) {
  if (canGrade && state.isGrader && !state.graderView) {
    // This is the case when the grader set `graderView` to false previously, we should keep the state.
    return false;
  }

  return canGrade;
}

export default function (state = {}, action) {
  switch (action.type) {
    case actions.FETCH_SUBMISSION_SUCCESS:
    case actions.SAVE_DRAFT_SUCCESS:
    case actions.FINALISE_SUCCESS:
    case actions.UNSUBMIT_SUCCESS:
    case actions.SAVE_GRADE_SUCCESS:
    case actions.MARK_SUCCESS:
    case actions.UNMARK_SUCCESS:
    case actions.PUBLISH_SUCCESS:
      const { canGrade, ...submission } = action.payload.submission;
      return {
        ...submission,
        isGrader: canGrade,
        graderView: calculateGraderView(state, canGrade),
      };
    case actions.ENTER_STUDENT_VIEW:
      return { ...state, graderView: false };
    case actions.EXIT_STUDENT_VIEW:
      return { ...state, graderView: true };
    default:
      return state;
  }
}
