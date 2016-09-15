//= require helpers/form_helpers

var TABLE_ROW_FORM_HELPERS = (function ($, FORM_HELPERS){
  'use strict';

  /**
   * Initializes elements that act as forms, but are not form nodes. In particular,
   * this is used in the case where each row in a table acts as a form.
   *
   * @param {String} selector Selector for the form's submit button.
   */
  function initializeAjaxForms(selector) {
    $(document).on('click', selector, onSubmit);
  }

  /**
   * Handles the submit button click event.
   *
   * @param e The event object.
   */
  function onSubmit(e) {
    var $button = $(e.target);
    var $form = FORM_HELPERS.parentFormForElement($button);

    FORM_HELPERS.submitAndDisableForm($form, onSubmitSuccess, onSubmitFailure);
    e.preventDefault();
  }

  /**
   * Handles the successful submit button click event.
   */
  function onSubmitSuccess(_, form) {
    FORM_HELPERS.enableForm($(form));
  }

  /**
   * Handles the errored submit button click event.
   */
  function onSubmitFailure(_, form) {
    // TODO: Implement error recovery.

    FORM_HELPERS.enableForm($(form));
  }

  return {
    initializeAjaxForms: initializeAjaxForms
  };
}(jQuery, FORM_HELPERS));
