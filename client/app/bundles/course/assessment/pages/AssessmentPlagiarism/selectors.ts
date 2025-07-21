import { AppState } from 'store';
import { AssessmentPlagiarismState } from 'types/course/plagiarism';

export const getAssessmentPlagiarism = (
  state: AppState,
): AssessmentPlagiarismState => state.assessments.plagiarism;
