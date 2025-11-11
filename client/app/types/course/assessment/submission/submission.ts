import { workflowStates } from 'course/assessment/submission/constants';

export type WorkflowState = 'attempting' | 'submitted' | 'graded' | 'published';

// The "unstarted" workflow state represents a student who has not clicked "Attempt" to create a submission
// (i.e. the submission for the assessment from them does not exist)

export type PossiblyUnstartedWorkflowState =
  | WorkflowState
  | typeof workflowStates.Unstarted;
