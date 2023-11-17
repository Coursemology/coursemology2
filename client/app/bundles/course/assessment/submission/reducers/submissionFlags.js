import actions from '../constants';

const initialState = {
  isLoading: true,
  isSaving: false,
  isSavingAnswer: {},
  isAutograding: false,
  isPublishing: false,
  isForceSubmitting: false,
  isReminding: false,
  isDownloadingFiles: false,
  isDownloadingCsv: false,
  isStatisticsDownloading: false,
  isUnsubmitting: false,
  isDeleting: false,
  isSubmissionBlocked: false,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.FETCH_SUBMISSIONS_REQUEST:
      return { ...state, isLoading: true };
    case actions.FETCH_SUBMISSION_SUCCESS:
    case actions.FETCH_SUBMISSION_FAILURE:
      return { ...state, isLoading: false };
    case actions.SUBMISSION_BLOCKED:
      return {
        ...state,
        isLoading: false,
        isSubmissionBlocked: true,
      };
    case actions.FETCH_SUBMISSIONS_SUCCESS:
    case actions.FETCH_SUBMISSIONS_FAILURE:
      return {
        ...state,
        isLoading: false,
        isPublishing: false,
        isForceSubmitting: false,
        isReminding: false,
      };
    case actions.SAVE_ANSWER_REQUEST:
      return {
        ...state,
        isSavingAnswer: action.payload.reduce(
          (acc, value) => ({ ...acc, [value.toString()]: true }),
          {},
        ),
      };
    case actions.SAVE_ANSWER_SUCCESS:
    case actions.SAVE_ANSWER_FAILURE:
      return { ...state, isSavingAnswer: {} };
    case actions.SAVE_DRAFT_REQUEST:
    case actions.SAVE_ALL_GRADE_REQUEST:
    case actions.SAVE_GRADE_REQUEST:
    case actions.FINALISE_REQUEST:
    case actions.UNSUBMIT_REQUEST:
    case actions.AUTOGRADE_REQUEST:
    case actions.REEVALUATE_REQUEST:
    case actions.RESET_REQUEST:
    case actions.MARK_REQUEST:
    case actions.UNMARK_REQUEST:
    case actions.PUBLISH_REQUEST:
    case actions.DELETE_FILE_REQUEST:
    case actions.IMPORT_FILES_REQUEST:
    case actions.GET_PAST_ANSWERS_REQUEST:
      return { ...state, isSaving: true };
    case actions.SAVE_DRAFT_SUCCESS:
    case actions.SAVE_ALL_GRADE_SUCCESS:
    case actions.SAVE_GRADE_SUCCESS:
    case actions.FINALISE_SUCCESS:
    case actions.UNSUBMIT_SUCCESS:
    case actions.REEVALUATE_SUCCESS:
    case actions.AUTOGRADE_SUCCESS:
    case actions.RESET_SUCCESS:
    case actions.MARK_SUCCESS:
    case actions.UNMARK_SUCCESS:
    case actions.PUBLISH_SUCCESS:
    case actions.DELETE_FILE_SUCCESS:
    case actions.IMPORT_FILES_SUCCESS:
      return { ...state, isSaving: false };
    case actions.SAVE_DRAFT_FAILURE:
    case actions.SAVE_ALL_GRADE_FAILURE:
    case actions.SAVE_GRADE_FAILURE:
    case actions.FINALISE_FAILURE:
    case actions.UNSUBMIT_FAILURE:
    case actions.REEVALUATE_FAILURE:
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

    case actions.DOWNLOAD_SUBMISSIONS_FILES_REQUEST:
      return { ...state, isDownloadingFiles: true };
    case actions.DOWNLOAD_SUBMISSIONS_FILES_SUCCESS:
    case actions.DOWNLOAD_SUBMISSIONS_FILES_FAILURE:
      return { ...state, isDownloadingFiles: false };

    case actions.DOWNLOAD_SUBMISSIONS_CSV_REQUEST:
      return { ...state, isDownloadingCsv: true };
    case actions.DOWNLOAD_SUBMISSIONS_CSV_SUCCESS:
    case actions.DOWNLOAD_SUBMISSIONS_CSV_FAILURE:
      return { ...state, isDownloadingCsv: false };

    case actions.DOWNLOAD_STATISTICS_REQUEST:
      return { ...state, isStatisticsDownloading: true };
    case actions.DOWNLOAD_STATISTICS_SUCCESS:
    case actions.DOWNLOAD_STATISTICS_FAILURE:
      return { ...state, isStatisticsDownloading: false };

    case actions.PUBLISH_SUBMISSIONS_REQUEST:
      return { ...state, isPublishing: true };
    case actions.PUBLISH_SUBMISSIONS_FAILURE:
      return { ...state, isPublishing: false };

    case actions.FORCE_SUBMIT_SUBMISSIONS_REQUEST:
      return { ...state, isForceSubmitting: true };
    case actions.FORCE_SUBMIT_SUBMISSIONS_FAILURE:
      return { ...state, isForceSubmitting: false };

    case actions.SEND_ASSESSMENT_REMINDER_REQUEST:
      return { ...state, isReminding: true };
    case actions.SEND_ASSESSMENT_REMINDER_SUCCESS:
    case actions.SEND_ASSESSMENT_REMINDER_FAILURE:
      return { ...state, isReminding: false };

    case actions.UNSUBMIT_ALL_SUBMISSIONS_REQUEST:
      return { ...state, isUnsubmitting: true };
    case actions.UNSUBMIT_ALL_SUBMISSIONS_SUCCESS:
    case actions.UNSUBMIT_ALL_SUBMISSIONS_FAILURE:
      return { ...state, isUnsubmitting: false };

    case actions.DELETE_ALL_SUBMISSIONS_REQUEST:
      return { ...state, isDeleting: true };
    case actions.DELETE_ALL_SUBMISSIONS_SUCCESS:
    case actions.DELETE_ALL_SUBMISSIONS_FAILURE:
      return { ...state, isDeleting: false };
    default:
      return state;
  }
}
