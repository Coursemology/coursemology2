import { AppState } from 'store';

import { AttachmentsState } from '../types';

const getLocalState = (state: AppState): AttachmentsState => {
  return state.assessments.submission.attachments;
};

export const getAttachments = (state: AppState): AttachmentsState => {
  return getLocalState(state);
};
