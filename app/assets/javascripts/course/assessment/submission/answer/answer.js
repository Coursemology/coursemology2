//= require helpers/form_helpers
//= require helpers/answer_helpers

(function($, FORM_HELPERS, ANSWER_HELPERS) {
  /* global Routes */
  'use strict';
  var DOCUMENT_SELECTOR = '.course-assessment-submission-submissions.edit ';

  /**
   * Shows the comments toolbar for submissions.
   *
   * This allows comments to be deleted.
   *
   * @param element
   */
  function showCommentToolbar(element) {
    var $comments = $('.discussion_post', element).filter(DOCUMENT_SELECTOR + '*');
    $comments.find('.toolbar').show();
  }

  /**
   * Shows reply buttons for annotations.
   *
   * `addBack` is required since the AJAX response inserts the reply button footer separately
   * rather than as part of the main discussion topic. `find` will fail to select the button if
   * the button is `element` itself.
   *
   * @param element
   */
  function showReplyButton(element) {
    var REPLY_COMMENT_SELECTOR = DOCUMENT_SELECTOR + '.reply-annotation';
    $(element).find(REPLY_COMMENT_SELECTOR).addBack(REPLY_COMMENT_SELECTOR).show();
  }

  /**
   * Shows forms for adding comments to answers.
   *
   * `addBack` is required since the AJAX response inserts the reply button footer separately
   * rather than as part of the main discussion topic. `find` will fail to select the button if
   * the button is `element` itself.
   *
   * @param element
   */
  function showAnswerCommentForm(element) {
    var FORM_SELECTOR = DOCUMENT_SELECTOR + '.answer-comment-form';
    $(element).find(FORM_SELECTOR).addBack(FORM_SELECTOR).show();
  }

  /**
   * Reveals widgets that enable user to use features with JavaScript functionality.
   *
   * @param element
   */
  function showScriptedWidgets(element) {
    showCommentToolbar(element);
    showReplyButton(element);
    showAnswerCommentForm(element);
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

  /**
   * Handles the comment delete button click event.
   *
   * @param e The event object.
   */
  function onCommentDelete(e) {
    var $element = $(e.target);

    var courseId = ANSWER_HELPERS.courseIdForElement($element);
    var assessmentId = ANSWER_HELPERS.assessmentIdForElement($element);
    var submissionId = ANSWER_HELPERS.submissionIdForElement($element);
    var answerId = ANSWER_HELPERS.answerIdForElement($element);
    var $post = $element.parents('.discussion_post:first');
    var postId = $post.data('postId');

    $.ajax({ url: Routes.course_assessment_submission_answer_comment_path(courseId,
                    assessmentId, submissionId, answerId, postId), method: 'delete' }).
      done(function(data) { onCommentDeleteSuccess(data, $element); }).
      fail(function(data) { onCommentDeleteFail(data, $element); });
    e.preventDefault();
  }

  /**
   * Handles the successful comment delete event.
   */
  function onCommentDeleteSuccess() {
  }

  /**
   * Handles the errored comment delete event.
   */
  function onCommentDeleteFail() {
    // TODO: Implement error recovery.
  }

  showScriptedWidgets(document);
  $(document).on('DOMNodeInserted', function(e) {
    showScriptedWidgets(e.target);
  });
  $(document).on('click', DOCUMENT_SELECTOR + '.comments .discussion_post .toolbar .delete',
    onCommentDelete);
  $(document).on('click', DOCUMENT_SELECTOR + '.comments .reply-comment', onCommentReply);
})(jQuery, FORM_HELPERS, ANSWER_HELPERS);
