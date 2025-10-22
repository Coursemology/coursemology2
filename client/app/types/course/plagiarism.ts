import { JobStatus, JobStatusResponse } from 'types/jobs';

import { ASSESSMENT_SIMILARITY_WORKFLOW_STATE } from 'lib/constants/sharedConstants';

import { UserInfo } from './statistics/assessmentStatistics';

export interface AssessmentPlagiarismSubmission {
  id: number;
  courseUser: UserInfo;
  assessmentTitle: string;
  courseTitle: string;
  submissionUrl: string;
  canManage: boolean;
}

export interface AssessmentPlagiarismSubmissionPair {
  baseSubmission: AssessmentPlagiarismSubmission;
  comparedSubmission: AssessmentPlagiarismSubmission;
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
  lastRunAt: string;
  job?: AssessmentPlagiarismJobData;
}

export interface AssessmentPlagiarism {
  status: AssessmentPlagiarismStatus;
  submissionPairs: AssessmentPlagiarismSubmissionPair[];
}

interface BaseAssessment {
  id: number;
  title: string;
  url: string;
}

export interface PlagiarismAssessmentListData extends BaseAssessment {
  plagiarismUrl: string;
  submissionsUrl: string;
  numCheckableQuestions: number;
  numSubmitted: number;
  numLinkedAssessments: number;
  lastSubmittedAt?: Date;
  plagiarismCheck?: PlagiarismCheck;
}

export interface PlagiarismCheck {
  assessmentId: number;
  workflowState: keyof typeof ASSESSMENT_SIMILARITY_WORKFLOW_STATE;
  lastRunTime?: Date;
  job?: JobStatusResponse;
}

export interface PlagiarismAssessments {
  assessments: PlagiarismAssessmentListData[];
}

export interface LinkedAssessment extends BaseAssessment {
  courseId: number;
  courseTitle: string;
  canManage: boolean;
}

export interface AssessmentLinkData {
  linkedAssessments: LinkedAssessment[];
  unlinkedAssessments: LinkedAssessment[];
}

export interface AssessmentPlagiarismState {
  data: AssessmentPlagiarism;
  isAllSubmissionPairsLoaded: boolean;
}

export interface PlagiarismAssessmentsState {
  assessments: Record<number, PlagiarismAssessmentListData>;
}
