import { AppState } from 'store';
import { PlagiarismAssessmentsState } from 'types/course/plagiarism';

export const getPlagiarismAssessments = (
  state: AppState,
): PlagiarismAssessmentsState => state.plagiarism.assessments;
