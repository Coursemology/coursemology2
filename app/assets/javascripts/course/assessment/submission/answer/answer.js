//= require helpers/form_helpers
//= require helpers/discussion/post_helpers

(function($, FORM_HELPERS,
             DISCUSSION_POST_HELPERS) {
  /* global Routes */
  'use strict';
  var DOCUMENT_SELECTOR = '.course-assessment-submission-submissions.edit ';

  /**
   * Shows forms for adding comments to answers.
   *
   * @param element
   */
  function showAnswerCommentForm(element) {
    var $form = $('.answer-comment-form', element).filter(DOCUMENT_SELECTOR + '*');
    $form.show();
  }

  /**
   * Handles the comment reply button click event.
   *
   * @param e The event object.
   */
  function onCommentReply(e) {
    var $button = $(e.target);
    var $form = FORM_HELPERS.parentFormForElement($button);
    FORM_HELPERS.submitAndDisableForm($form, onCommentReplySuccess, onCommentReplyFail);
    e.preventDefault();
  }

  /**
   * Handles the successful comment reply event.
   */
  function onCommentReplySuccess() {
  }

  /**
   * Handles the errored comment reply event.
   */
  function onCommentReplyFail(_, form) {
    // TODO: Implement error recovery.
    var $form = $(form);
    FORM_HELPERS.findFormFields($form).prop('disabled', false);
  }

  showAnswerCommentForm(document);
  $(document).on('DOMNodeInserted', function(e) {
    showAnswerCommentForm(e.target);
  });
  $(document).on('click', DOCUMENT_SELECTOR + '.comments .reply-comment', onCommentReply);
  DISCUSSION_POST_HELPERS.initializeToolbar(document, DOCUMENT_SELECTOR + '.comments ');
})(jQuery, FORM_HELPERS,
           DISCUSSION_POST_HELPERS);
