//= require helpers/form_helpers

(function($, FORM_HELPERS) {
  /* global Routes */
  'use strict';
  var DOCUMENT_SELECTOR = '.course-users ';
  var UPDATE_BUTTON_SELECTOR = 'tr.course_user #update';

  /**
   * Shows update course user buttons.
   */
  function showUpdateCourseUserButtons() {
    var $buttons = $(UPDATE_BUTTON_SELECTOR).filter(DOCUMENT_SELECTOR + '*');
    $buttons.show();
  }

  /**
   * Handles the update course user button click event.
   *
   * @param e The event object.
   */
  function onUpdateCourseUserButtonClick(e) {
    var $button = $(e.target);
    var $form = FORM_HELPERS.parentFormForElement($button);

    FORM_HELPERS.submitAndDisableForm($form, onUpdateCourseUserSuccess,
                                             onUpdateCourseUserFailure);
    e.preventDefault();
  }

  /**
   * Handles the successful update course user event.
   */
  function onUpdateCourseUserSuccess(_, form) {
    FORM_HELPERS.enableForm($(form));
  }

  /**
   * Handles the errored update course user event.
   */
  function onUpdateCourseUserFailure(_, form) {
    // TODO: Implement error recovery.
    FORM_HELPERS.enableForm($(form));
  }

  $(document).on('turbolinks:load', showUpdateCourseUserButtons);
  $(document).on('click', DOCUMENT_SELECTOR + UPDATE_BUTTON_SELECTOR,
                          onUpdateCourseUserButtonClick);
})(jQuery, FORM_HELPERS);
