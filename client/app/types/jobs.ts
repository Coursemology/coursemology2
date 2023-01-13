export interface JobSubmitted {
  status: 'submitted';
  jobUrl: string;
}

export interface JobCompleted {
  status: 'completed';
  message?: string;
  redirectUrl?: string;
}

export interface JobErrored {
  status: 'errored';
  message: string;
  errorMessage?: string;
}

export type JobStatusResponse = JobSubmitted | JobCompleted | JobErrored;
