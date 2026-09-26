import { AppState } from 'store';

import { CommentFormsState } from '../reducers/commentForms';

export const getCommentForms = (state: AppState): CommentFormsState =>
  state.assessments.submission.commentForms;
