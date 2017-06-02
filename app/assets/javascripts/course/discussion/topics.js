//= require helpers/form_helpers
//= require helpers/discussion/post_helpers

(function($, FORM_HELPERS,
             DISCUSSION_POST_HELPERS) {
  'use strict';
  var DOCUMENT_SELECTOR = '.course-discussion-topics ';

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
    FORM_HELPERS.enableForm($(form));

    // TODO: Display error messages.
  }

  $(document).ready(function() {
    showCommentBoxes();
    DISCUSSION_POST_HELPERS.initializeToolbar(document, DOCUMENT_SELECTOR);
  });
  $(document).on('submit', DOCUMENT_SELECTOR + '.post-form', onPostFormSubmit);
})(jQuery, FORM_HELPERS,
           DISCUSSION_POST_HELPERS);
