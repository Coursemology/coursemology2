import { AppState } from 'store';

import { PreviewAutogradingState } from '../types';

export const getPreviewAutograding = (
  state: AppState,
): PreviewAutogradingState => {
  return state.assessments.submission.previewAutograding;
};
