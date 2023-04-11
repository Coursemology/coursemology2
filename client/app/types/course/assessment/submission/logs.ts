import { WorkflowState } from './submission';

export interface LogsData {
  isValidAttempt: boolean;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  userSessionId: string;
  submissionSessionId: string;
}

export interface LogsMainInfo {
  assessmentTitle: string;
  assessmentUrl: string;
  studentName: string;
  studentUrl: string;
  submissionWorkflowState: WorkflowState;
  editUrl: string;
}

export interface LogInfo {
  info: LogsMainInfo;
  logs: LogsData[];
}
