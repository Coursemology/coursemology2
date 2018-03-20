/* eslint-disable import/prefer-default-export */
import { SubmissionError as ReduxFormSubmissionError } from 'redux-form';

/**
 * For Rails ActiveModel objects, errors that belong to the top-level object itself are
 * set on the key `base`. On the other hand, top level errors need to be set on `_error`
 * for redux-form to display them. This wrapper does the translation.
 */
export class SubmissionError extends ReduxFormSubmissionError {
  constructor(params) {
    const { base } = params;
    const errors = base ? { ...params, _error: base } : params;
    // eslint-disable-next-line constructor-super
    return super(errors);
  }
}
