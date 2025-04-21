import { CourseUserBasicListData } from 'types/course/courseUsers';

import { WorkflowState } from './submission';

export interface CommentItem {
  id: number;
  createdAt: Date;
  creator: CourseUserBasicListData;
  isDelayed: boolean;
  text: string;
}

export interface AllAnswerItem {
  id: number;
  createdAt: Date;
  currentAnswer: boolean;
  workflowState: WorkflowState;
}

export interface SubmissionQuestionDetails {
  allAnswers: AllAnswerItem[];
  comments: CommentItem[];
  canViewHistory: boolean;
}
