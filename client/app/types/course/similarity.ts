import { JobStatus } from 'types/jobs';

import { ASSESSMENT_SIMILARITY_WORKFLOW_STATE } from 'lib/constants/sharedConstants';

import { UserInfo } from './statistics/assessmentStatistics';

export interface AssessmentSimilaritySubmissionPair {
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

export interface AssessmentSimilarityJobData {
  jobId: number;
  jobStatus: keyof typeof JobStatus;
  jobUrl?: string;
  errorMessage?: string;
}

export interface AssessmentSimilarityStatus {
  workflowState: keyof typeof ASSESSMENT_SIMILARITY_WORKFLOW_STATE;
  lastRunAt: Date;
  job?: AssessmentSimilarityJobData;
}

export interface AssessmentSimilarity {
  status: AssessmentSimilarityStatus;
  submissionPairs: AssessmentSimilaritySubmissionPair[];
}

export interface SimilarityAssessmentListData {
  id: number;
  title: string;
  url: string;
  similarityUrl: string;
  submissionsUrl: string;
  numCheckableQuestions: number;
  numSubmitted: number;
  lastSubmittedAt?: Date;
  workflowState: keyof typeof ASSESSMENT_SIMILARITY_WORKFLOW_STATE;
  lastRunTime?: Date;
  errorMessage?: string;
}

export interface SimilarityAssessments {
  assessments: SimilarityAssessmentListData[];
}

export interface AssessmentSimilarityState {
  data: AssessmentSimilarity;
}

export type SimilarityAssessmentsState = SimilarityAssessments;
