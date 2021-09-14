import actions from '../constants';

const initialState = {
  isLoading: true,
  isSaving: false,
  isAutograding: false,
  isPublishing: false,
  isDownloading: false,
  isStatisticsDownloading: false,
};

export default function(state = initialState, action) {
  switch (action.type) {
    case actions.FETCH_SUBMISSION_SUCCESS:
    case actions.FETCH_SUBMISSION_FAILURE:
      return { ...state, isLoading: false };
    case actions.FETCH_SUBMISSIONS_SUCCESS:
    case actions.FETCH_SUBMISSIONS_FAILURE:
      return { ...state, isLoading: false, isPublishing: false };

    case actions.SAVE_DRAFT_REQUEST:
    case actions.SAVE_GRADE_REQUEST:
    case actions.FINALISE_REQUEST:
    case actions.UNSUBMIT_REQUEST:
    case actions.AUTOGRADE_REQUEST:
    case actions.RESET_REQUEST:
    case actions.MARK_REQUEST:
    case actions.UNMARK_REQUEST:
    case actions.PUBLISH_REQUEST:
    case actions.DELETE_FILE_REQUEST:
    case actions.IMPORT_FILES_REQUEST:
    case actions.GET_PAST_ANSWERS_REQUEST:
      return { ...state, isSaving: true };
    case actions.SAVE_DRAFT_SUCCESS:
    case actions.SAVE_GRADE_SUCCESS:
    case actions.FINALISE_SUCCESS:
    case actions.UNSUBMIT_SUCCESS:
    case actions.AUTOGRADE_SUCCESS:
    case actions.RESET_SUCCESS:
    case actions.MARK_SUCCESS:
    case actions.UNMARK_SUCCESS:
    case actions.PUBLISH_SUCCESS:
    case actions.DELETE_FILE_SUCCESS:
    case actions.IMPORT_FILES_SUCCESS:
      return { ...state, isSaving: false };
    case actions.SAVE_DRAFT_FAILURE:
    case actions.SAVE_GRADE_FAILURE:
    case actions.FINALISE_FAILURE:
    case actions.UNSUBMIT_FAILURE:
    case actions.AUTOGRADE_FAILURE:
    case actions.RESET_FAILURE:
    case actions.MARK_FAILURE:
    case actions.UNMARK_FAILURE:
    case actions.PUBLISH_FAILURE:
    case actions.DELETE_FILE_FAILURE:
    case actions.IMPORT_FILES_FAILURE:
    case actions.GET_PAST_ANSWERS_SUCCESS:
    case actions.GET_PAST_ANSWERS_FAILURE:
      return { ...state, isSaving: false };
    case actions.AUTOGRADE_SUBMISSION_REQUEST:
      return { ...state, isAutograding: true };
    case actions.AUTOGRADE_SUBMISSION_SUCCESS:
    case actions.AUTOGRADE_SUBMISSION_FAILURE:
      return { ...state, isAutograding: false };

    case actions.DOWNLOAD_SUBMISSIONS_REQUEST:
      return { ...state, isDownloading: true };
    case actions.DOWNLOAD_SUBMISSIONS_SUCCESS:
    case actions.DOWNLOAD_SUBMISSIONS_FAILURE:
      return { ...state, isDownloading: false };

    case actions.DOWNLOAD_STATISTICS_REQUEST:
      return { ...state, isStatisticsDownloading: true };
    case actions.DOWNLOAD_STATISTICS_SUCCESS:
      return { ...state, isStatisticsDownloading: false };
    case actions.DOWNLOAD_STATISTICS_FAILURE:
      return { ...state, isStatisticsDownloading: false };

    case actions.PUBLISH_SUBMISSIONS_REQUEST:
      return { ...state, isPublishing: true };
    case actions.PUBLISH_SUBMISSIONS_FAILURE:
      return { ...state, isPublishing: false };
    default:
      return state;
  }
}
