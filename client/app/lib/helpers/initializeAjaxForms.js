import { enableForm, parentFormForElement, submitAndDisableForm } from './form-helpers';

/**
 * Handles the successful submit button click event.
 */
function onSubmitSuccess(_, form) {
  enableForm($(form));
}

/**
 * Handles the errored submit button click event.
 */
function onSubmitFailure(_, form) {
  // TODO: Implement error recovery.

  enableForm($(form));
}

/**
 * Handles the submit button click event.
 *
 * @param e The event object.
 */
function onSubmit(e) {
  const $button = $(e.target);
  const $form = parentFormForElement($button);

  submitAndDisableForm($form, onSubmitSuccess, onSubmitFailure);
  e.preventDefault();
}

/**
 * Initializes elements that act as forms, but are not form nodes. In particular,
 * this is used in the case where each row in a table acts as a form.
 *
 * @param {String} selector Selector for the form's submit button.
 */
export default function initializeAjaxForms(selector) {
  $(document).on('click', selector, onSubmit);
}
