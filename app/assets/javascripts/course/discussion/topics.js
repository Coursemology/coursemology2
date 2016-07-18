//= require helpers/form_helpers

(function($, FORM_HELPERS) {
  'use strict';
  var DOCUMENT_SELECTOR = '.course-discussion-topics.index ';

  // The comment boxes are hidden by default, show the boxes if the browser supports javascript.
  function showCommentBoxes() {
    var $forms = $('.post-form').filter(DOCUMENT_SELECTOR + '*');
    $forms.show();
  }

  function onPostFormSubmit(e) {
    var $form = $(e.target);
    FORM_HELPERS.submitAndDisableForm($form, onPostFormSubmitSuccess,
                                             onPostFormSubmitFail);
    e.preventDefault();
  }

  function onPostFormSubmitSuccess(_, form) {
  }

  function onPostFormSubmitFail(_, form) {
    var $form = $(form);
    FORM_HELPERS.findFormFields($form).prop('disabled', false);

    // TODO: Display error messages.
  }

  $(document).on('page:load ready', showCommentBoxes);
  $(document).on('submit', DOCUMENT_SELECTOR + '.post-form', onPostFormSubmit);
})(jQuery, FORM_HELPERS);
