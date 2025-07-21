import { JobStatus } from 'types/jobs';

import { ASSESSMENT_SIMILARITY_WORKFLOW_STATE } from 'lib/constants/sharedConstants';

import { UserInfo } from './statistics/assessmentStatistics';

export interface AssessmentPlagiarismSubmissionPair {
  baseSubmission: {
    id: number;
    courseUser: UserInfo;
    submissionUrl: string;
  };
  comparedSubmission: {
    id: number;
    courseUser: UserInfo;
    submissionUrl: string;
  };
  similarityScore: number;
  submissionPairId: number;
}

export interface AssessmentPlagiarismJobData {
  jobId: number;
  jobStatus: keyof typeof JobStatus;
  jobUrl?: string;
  errorMessage?: string;
}

export interface AssessmentPlagiarismStatus {
  workflowState: keyof typeof ASSESSMENT_SIMILARITY_WORKFLOW_STATE;
  lastRunAt: Date;
  job?: AssessmentPlagiarismJobData;
}

export interface AssessmentPlagiarism {
  status: AssessmentPlagiarismStatus;
  submissionPairs: AssessmentPlagiarismSubmissionPair[];
}

export interface PlagiarismAssessmentListData {
  id: number;
  title: string;
  url: string;
  plagiarismUrl: string;
  submissionsUrl: string;
  numCheckableQuestions: number;
  numSubmitted: number;
  lastSubmittedAt?: Date;
  workflowState: keyof typeof ASSESSMENT_SIMILARITY_WORKFLOW_STATE;
  lastRunTime?: Date;
  errorMessage?: string;
}

export interface PlagiarismAssessments {
  assessments: PlagiarismAssessmentListData[];
}

export interface AssessmentPlagiarismState {
  data: AssessmentPlagiarism;
}

export type PlagiarismAssessmentsState = PlagiarismAssessments;
