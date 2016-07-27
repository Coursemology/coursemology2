//= require helpers/form_helpers
//= require helpers/course_helpers
//= require helpers/answer_helpers
//= require templates/course/assessment/submission/answer/comment_form

(function($, FORM_HELPERS,
             COURSE_HELPERS,
             ANSWER_HELPERS) {
  /* global Routes */
  'use strict';
  var DOCUMENT_SELECTOR = '.course-assessment-submission-submissions.edit ';
  var render = FORM_HELPERS.renderFromPath('templates/course/assessment/submission/answer/');

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
   * @param element
   */
  function showReplyButton(element) {
    var $button = $('.reply-annotation', element).filter(DOCUMENT_SELECTOR + '*');
    $button.show();
  }

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
   * Handles the answer comment edit button click event.
   *
   * @param e The event object.
   */
  function onCommentEdit(e) {
    var $element = $(e.target);
    var $post = $element.parents('.discussion_post:first');

    var courseId = COURSE_HELPERS.courseIdForElement($element);
    var assessmentId = ANSWER_HELPERS.assessmentIdForElement($element);
    var submissionId = ANSWER_HELPERS.submissionIdForElement($element);
    var answerId = ANSWER_HELPERS.answerIdForElement($element);
    var postId = $post.data('postId');
    var postContent = $post.find('.content').text();
    var postCommenter = $post.find('.user').html();

    $post.children().hide();
    var $form = createCommentForm($post, courseId, assessmentId, submissionId,
                                  answerId, postId, postContent, postCommenter);
    e.preventDefault();
  }

  /**
   * Finds the form for a given answer comment.
   *
   * @param {jQuery} $element The answer comment to search for the form in.
   * @return {jQuery} The answer comment form which was found.
   */
  function findAnswerCommentForm($element) {
    return $element.find('> div.answer-comment-form');
  }

  /**
   * Creates a form for the user to edit his answer comment.
   *
   * @param {jQuery} $element The element to search for the form.
   * @param {Number} courseId The course ID that the comment is associated with.
   * @param {Number} assessmentId The assessment ID that the comment is associated with.
   * @param {Number} submissionId The submission ID that the comment is associated with.
   * @param {Number} answerId The answer ID that the comment is associated with.
   * @param {Number} postId The ID of the comment being edited.
   * @param {String} postContent The existing contents of the comment's text field.
   * @param {HTMLElement} postCommenter The commenter's name with a link to his profile.
   * @return {jQuery} The form for the annotation post.
   */
  function createCommentForm($element, courseId, assessmentId, submissionId, answerId,
                             postId, postContent, postCommenter) {
    $element.append(render('comment_form', {
      courseId: courseId,
      assessmentId: assessmentId,
      submissionId: submissionId,
      answerId: answerId,
      postId: postId,
      postContent: postContent,
      postCommenter: postCommenter
    }));

    return findAnswerCommentForm($element);
  }

  /**
   * Handles the reset of the answer comment form.
   *
   * @param e The event object.
   */
  function onCommentFormResetted(e) {
    var $button = $(e.target);
    var $post = $button.parents('.discussion_post:first');

    FORM_HELPERS.removeParentForm($button);
    $post.children().show();
  }

  /**
   * Handles the submission of the answer comment form.
   *
   * @param e The event object.
   */
  function onCommentFormSubmitted(e) {
    var $button = $(e.target);
    var $form = FORM_HELPERS.parentFormForElement($button);
    FORM_HELPERS.submitAndDisableForm($form, onCommentFormSubmitSuccess,
                                             onCommentFormSubmitFail);
    e.preventDefault();
  }

  /**
   * Handles the successful answer comment save event.
   */
  function onCommentFormSubmitSuccess() {
  }

  /**
   * Handles the errored answer comment save event.
   *
   * @param {HTMLElement} form The form which was submitted
   */
  function onCommentFormSubmitFail(_, form) {
    var $form = $(form);
    FORM_HELPERS.findFormFields($form).prop('disabled', false);

    // TODO: Implement error recovery.
  }

  /**
   * Handles the comment delete button click event.
   *
   * @param e The event object.
   */
  function onCommentDelete(e) {
    var $element = $(e.target);

    var courseId = COURSE_HELPERS.courseIdForElement($element);
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
  $(document).on('click', DOCUMENT_SELECTOR + '.answer-comment-form input[type="reset"]',
    onCommentFormResetted);
  $(document).on('click', DOCUMENT_SELECTOR + '.answer-comment-form input[type="submit"]',
    onCommentFormSubmitted);
  $(document).on('click', DOCUMENT_SELECTOR + '.comments .discussion_post .toolbar .edit',
    onCommentEdit);
  $(document).on('click', DOCUMENT_SELECTOR + '.comments .discussion_post .toolbar .delete',
    onCommentDelete);
  $(document).on('click', DOCUMENT_SELECTOR + '.comments .reply-comment', onCommentReply);
})(jQuery, FORM_HELPERS,
           COURSE_HELPERS,
           ANSWER_HELPERS);
