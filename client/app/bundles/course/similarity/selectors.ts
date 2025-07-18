import { AppState } from 'store';
import { SimilarityAssessmentsState } from 'types/course/similarity';

export const getSimilarityAssessments = (
  state: AppState,
): SimilarityAssessmentsState => state.similarity.assessments;
