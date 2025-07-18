import { AppState } from 'store';
import { AssessmentSimilarityState } from 'types/course/similarity';

export const getAssessmentSimilarity = (
  state: AppState,
): AssessmentSimilarityState => state.assessments.similarity;
