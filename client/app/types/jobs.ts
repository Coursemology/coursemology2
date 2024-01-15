export enum JobStatus {
  'submitted' = 'submitted',
  'completed' = 'completed',
  'errored' = 'errored',
}

export interface JobSubmitted {
  status: JobStatus.submitted;
  jobUrl: string;
}

export interface JobCompleted {
  status: JobStatus.completed;
  message?: string;
  redirectUrl?: string;
}

export interface JobErrored {
  status: JobStatus.errored;
  message: string;
  errorMessage?: string;
}

export type JobStatusResponse = JobSubmitted | JobCompleted | JobErrored;
