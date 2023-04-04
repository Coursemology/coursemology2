export interface LogsData {
  validAttempt: boolean;
  timestamp: Date;
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
  submissionStatus: string;
  editUrl: string;
}

interface LogInfo {
  info: LogsMainInfo;
  logs: LogsData[];
}

export interface LogsInfo {
  log: LogInfo;
}
