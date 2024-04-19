import mirrorCreator from 'mirror-creator';

export const formNames = mirrorCreator(['SUBMISSION']);

export const questionTypes = mirrorCreator([
  'MultipleChoice',
  'MultipleResponse',
  'Programming',
  'TextResponse',
  'Comprehension',
  'FileUpload',
  'Scribing',
  'VoiceResponse',
  'ForumPostResponse',
]);

export const MEGABYTES_TO_BYTES = 1024 * 1024;

export const workflowStates = {
  Unstarted: 'unstarted' as const,
  Attempting: 'attempting' as const,
  Submitted: 'submitted' as const,
  Graded: 'graded' as const,
  Published: 'published' as const,
  Unreleased: 'unreleased' as const,
};

export const dueInStates = {
  NotDue: 'notDue' as const,
  AlmostDue: 'almostDue' as const,
  OverDue: 'overDue' as const,
};

export const ALMOST_DUE_THRESHOLD = 3 * 24 * 60 * 60; // 3 days

export const TestCaseTypes = {
  Public: 'public_test',
  Private: 'private_test',
  Evaluation: 'evaluation_test',
};

export const selectedUserType = mirrorCreator([
  'my_students',
  'my_students_w_phantom',
  'students',
  'students_w_phantom',
  'staff',
  'staff_w_phantom',
]);

export const selectedUserTypeDisplay = {
  my_students: 'MY STUDENTS',
  my_students_w_phantom: 'MY STUDENTS INCL. PHANTOM',
  students: 'STUDENTS',
  students_w_phantom: 'STUDENTS INCL. PHANTOM',
  staff: 'STAFF',
  staff_w_phantom: 'STAFF INCL. PHANTOM',
};

export const scribingPopoverTypes = mirrorCreator([
  'TYPE',
  'DRAW',
  'LINE',
  'SHAPE',
  'LAYER',
]);

export const scribingToolColor = mirrorCreator([
  'TYPE',
  'DRAW',
  'LINE',
  'SHAPE_BORDER',
  'SHAPE_FILL',
]);

export const scribingToolThickness = mirrorCreator([
  'DRAW',
  'LINE',
  'SHAPE_BORDER',
]);

export const scribingToolLineStyle = mirrorCreator(['LINE', 'SHAPE_BORDER']);

export const scribingTools = mirrorCreator([
  'TYPE',
  'DRAW',
  'LINE',
  'SHAPE',
  'SELECT',
  'MOVE',
  'UNDO',
  'REDO',
  'ZOOM_IN',
  'ZOOM_OUT',
  'DELETE',
]);

export const scribingShapes = mirrorCreator(['RECT', 'ELLIPSE']);

export const canvasActionTypes = mirrorCreator([
  'SET_CANVAS',
  'SET_CANVAS_LOADED',
  'SET_TOOL_SELECTED',
  'SET_FONT_FAMILY',
  'SET_FONT_SIZE',
  'SET_LINE_STYLE_CHIP',
  'SET_COLORING_TOOL_COLOR',
  'SET_TOOL_THICKNESS',
  'SET_SELECTED_SHAPE',
  'SET_NO_FILL',
  'SET_CANVAS_LOADED',
  'OPEN_POPOVER',
  'CLOSE_POPOVER',
  'ADD_LAYER',
  'SET_LAYER_DISPLAY',
  'SET_CANVAS_PROPERTIES',
  'SET_DRAWING_MODE',
  'SET_CANVAS_CURSOR',
  'SET_CURRENT_STATE_INDEX',
  'SET_CANVAS_STATES',
  'UPDATE_CANVAS_STATE',
  'SET_ACTIVE_OBJECT',
  'SET_CANVAS_ZOOM',
  'RESET_CHANGE_TOOL',
  'DELETE_CANVAS_OBJECT',
  'RESET_CANVAS_DELETE',
  'SET_DISABLE_OBJECT_SELECTION',
  'RESET_DISABLE_OBJECT_SELECTION',
  'SET_ENABLE_OBJECT_SELECTION',
  'RESET_ENABLE_OBJECT_SELECTION',
  'SET_ENABLE_TEXT_SELECTION',
  'RESET_ENABLE_TEXT_SELECTION',
  'SET_CANVAS_DIRTY',
  'RESET_CANVAS_DIRTY',
  'SET_CANVAS_SAVE',
  'RESET_CANVAS_SAVE',
  'SET_UNDO',
  'RESET_UNDO',
  'SET_REDO',
  'RESET_REDO',
]);

export const defaultPastAnswersDisplayed = 3;

const actionTypes = mirrorCreator([
  'PURGE_SUBMISSION_STORE',
  'FETCH_SUBMISSION_REQUEST',
  'FETCH_SUBMISSION_SUCCESS',
  'FETCH_SUBMISSION_FAILURE',
  'SUBMISSION_BLOCKED',
  'AUTOGRADE_SUBMISSION_REQUEST',
  'AUTOGRADE_SUBMISSION_SUCCESS',
  'AUTOGRADE_SUBMISSION_FAILURE',
  'SAVE_ANSWER_REQUEST',
  'SAVE_ANSWER_SUCCESS',
  'SAVE_ANSWER_FAILURE',
  'FINALISE_REQUEST',
  'FINALISE_SUCCESS',
  'FINALISE_FAILURE',
  'UNSUBMIT_REQUEST',
  'UNSUBMIT_SUCCESS',
  'UNSUBMIT_FAILURE',
  'AUTOGRADE_REQUEST',
  'AUTOGRADE_SUCCESS',
  'AUTOGRADE_FAILURE',
  'AUTOGRADE_SAVING_SUCCESS',
  'AUTOGRADE_SAVING_FAILURE',
  'FEEDBACK_REQUEST',
  'FEEDBACK_SUCCESS',
  'FEEDBACK_FAILURE',
  'REEVALUATE_REQUEST',
  'REEVALUATE_SUCCESS',
  'REEVALUATE_FAILURE',
  'RESET_REQUEST',
  'RESET_SUCCESS',
  'RESET_FAILURE',
  'SAVE_ALL_GRADE_REQUEST',
  'SAVE_ALL_GRADE_SUCCESS',
  'SAVE_ALL_GRADE_FAILURE',
  'SAVE_GRADE_REQUEST',
  'SAVE_GRADE_SUCCESS',
  'SAVE_GRADE_FAILURE',
  'MARK_REQUEST',
  'MARK_SUCCESS',
  'MARK_FAILURE',
  'UNMARK_REQUEST',
  'UNMARK_SUCCESS',
  'UNMARK_FAILURE',
  'PUBLISH_REQUEST',
  'PUBLISH_SUCCESS',
  'PUBLISH_FAILURE',
  'RECORDER_SET_RECORDING',
  'RECORDER_SET_UNRECORDING',
  'RECORDER_COMPONENT_MOUNT',
  'RECORDER_COMPONENT_UNMOUNT',
  'CREATE_COMMENT_REQUEST',
  'CREATE_COMMENT_SUCCESS',
  'CREATE_COMMENT_FAILURE',
  'CREATE_COMMENT_CHANGE',
  'UPDATE_COMMENT_REQUEST',
  'UPDATE_COMMENT_SUCCESS',
  'UPDATE_COMMENT_FAILURE',
  'UPDATE_COMMENT_CHANGE',
  'DELETE_COMMENT_REQUEST',
  'DELETE_COMMENT_SUCCESS',
  'DELETE_COMMENT_FAILURE',
  'CREATE_ANNOTATION_REQUEST',
  'CREATE_ANNOTATION_SUCCESS',
  'CREATE_ANNOTATION_FAILURE',
  'CREATE_ANNOTATION_CHANGE',
  'UPDATE_ANNOTATION_REQUEST',
  'UPDATE_ANNOTATION_SUCCESS',
  'UPDATE_ANNOTATION_FAILURE',
  'UPDATE_ANNOTATION_CHANGE',
  'DELETE_ANNOTATION_REQUEST',
  'DELETE_ANNOTATION_SUCCESS',
  'DELETE_ANNOTATION_FAILURE',
  'DELETE_ATTACHMENT_REQUEST',
  'DELETE_ATTACHMENT_SUCCESS',
  'DELETE_ATTACHMENT_FAILURE',
  'UPDATE_GRADING',
  'UPDATE_EXP',
  'UPDATE_MULTIPLIER',
  'ENTER_STUDENT_VIEW',
  'EXIT_STUDENT_VIEW',

  'FETCH_SUBMISSIONS_REQUEST',
  'FETCH_SUBMISSIONS_SUCCESS',
  'FETCH_SUBMISSIONS_FAILURE',
  'PUBLISH_SUBMISSIONS_REQUEST',
  'PUBLISH_SUBMISSIONS_SUCCESS',
  'PUBLISH_SUBMISSIONS_FAILURE',
  'FORCE_SUBMIT_SUBMISSIONS_REQUEST',
  'FORCE_SUBMIT_SUBMISSIONS_SUCCESS',
  'FORCE_SUBMIT_SUBMISSIONS_FAILURE',
  'SEND_ASSESSMENT_REMINDER_REQUEST',
  'SEND_ASSESSMENT_REMINDER_SUCCESS',
  'SEND_ASSESSMENT_REMINDER_FAILURE',
  'DOWNLOAD_SUBMISSIONS_FILES_REQUEST',
  'DOWNLOAD_SUBMISSIONS_FILES_SUCCESS',
  'DOWNLOAD_SUBMISSIONS_FILES_FAILURE',
  'DOWNLOAD_SUBMISSIONS_CSV_REQUEST',
  'DOWNLOAD_SUBMISSIONS_CSV_SUCCESS',
  'DOWNLOAD_SUBMISSIONS_CSV_FAILURE',
  'DOWNLOAD_STATISTICS_REQUEST',
  'DOWNLOAD_STATISTICS_SUCCESS',
  'DOWNLOAD_STATISTICS_FAILURE',
  'UNSUBMIT_SUBMISSION_REQUEST',
  'UNSUBMIT_SUBMISSION_SUCCESS',
  'UNSUBMIT_SUBMISSION_FAILURE',
  'UNSUBMIT_ALL_SUBMISSIONS_REQUEST',
  'UNSUBMIT_ALL_SUBMISSIONS_SUCCESS',
  'UNSUBMIT_ALL_SUBMISSIONS_FAILURE',
  'DELETE_SUBMISSION_REQUEST',
  'DELETE_SUBMISSION_SUCCESS',
  'DELETE_SUBMISSION_FAILURE',
  'DELETE_ALL_SUBMISSIONS_REQUEST',
  'DELETE_ALL_SUBMISSIONS_SUCCESS',
  'DELETE_ALL_SUBMISSIONS_FAILURE',

  // View Past Answer History action types
  'TOGGLE_VIEW_HISTORY_MODE',
  'SELECT_PAST_ANSWERS',
  'GET_PAST_ANSWERS_REQUEST',
  'GET_PAST_ANSWERS_SUCCESS',
  'GET_PAST_ANSWERS_FAILURE',

  // Answer action types
  'UPDATE_ANSWER_CLIENT_VERSION',

  // Scribing answer action types
  'SET_CANVAS_LOADED',
  'FETCH_SCRIBING_QUESTION_REQUEST',
  'FETCH_SCRIBING_QUESTION_SUCCESS',
  'FETCH_SCRIBING_QUESTION_FAILURE',
  'FETCH_SCRIBING_ANSWER_REQUEST',
  'FETCH_SCRIBING_ANSWER_SUCCESS',
  'FETCH_SCRIBING_ANSWER_FAILURE',
  'UPDATE_SCRIBING_ANSWER_REQUEST',
  'UPDATE_SCRIBING_ANSWER_SUCCESS',
  'UPDATE_SCRIBING_ANSWER_FAILURE',
  'UPDATE_SCRIBING_ANSWER_IN_LOCAL',

  // Text Response answer action types
  'UPLOAD_TEXT_RESPONSE_FILES_REQUEST',
  'UPLOAD_TEXT_RESPONSE_FILES_SUCCESS',
  'UPLOAD_TEXT_RESPONSE_FILES_FAILURE',

  // Programming answer action types
  'DELETE_PROGRAMMING_FILE_REQUEST',
  'DELETE_PROGRAMMING_FILE_SUCCESS',
  'DELETE_PROGRAMMING_FILE_FAILURE',
  'UPLOAD_PROGRAMMING_FILES_REQUEST',
  'UPLOAD_PROGRAMMING_FILES_SUCCESS',
  'UPLOAD_PROGRAMMING_FILES_FAILURE',
]);

export default actionTypes;
