import mirrorCreator from 'mirror-creator';

export const formNames = mirrorCreator(['ASSESSMENT']);

const actionTypes = mirrorCreator([
  'ASSESSMENT_FORM_SHOW',
  'ASSESSMENT_FORM_CANCEL',
  'ASSESSMENT_FORM_CONFIRM_CANCEL',
  'ASSESSMENT_FORM_CONFIRM_DISCARD',
  'CREATE_ASSESSMENT_REQUEST',
  'CREATE_ASSESSMENT_SUCCESS',
  'CREATE_ASSESSMENT_FAILURE',
  'FETCH_TABS_REQUEST',
  'FETCH_TABS_SUCCESS',
  'FETCH_TABS_FAILURE',
  'UPDATE_ASSESSMENT_REQUEST',
  'UPDATE_ASSESSMENT_SUCCESS',
  'UPDATE_ASSESSMENT_FAILURE',
  'FETCH_STATISTICS_REQUEST',
  'FETCH_STATISTICS_SUCCESS',
  'FETCH_STATISTICS_FAILURE',
  'FETCH_ANCESTORS_REQUEST',
  'FETCH_ANCESTORS_SUCCESS',
  'FETCH_ANCESTORS_FAILURE',
  'FETCH_ANCESTOR_STATISTICS_REQUEST',
  'FETCH_ANCESTOR_STATISTICS_SUCCESS',
  'FETCH_ANCESTOR_STATISTICS_FAILURE',
]);

export const plagiarismWorkflowStates = {
  NotStarted: 'not_started',
  Starting: 'starting',
  Running: 'running',
  Completed: 'completed',
  Failed: 'failed',
};

export const DEFAULT_MONITORING_OPTIONS = {
  enabled: false,
  secret: '',
  min_interval_ms: 20000,
  max_interval_ms: 30000,
  offset_ms: 3000,
  blocks: false,
  browser_authorization: true,
  browser_authorization_method: 'user_agent',
};

export const PLAGIARISM_JOB_POLL_INTERVAL_MS = 5000;

export default actionTypes;
