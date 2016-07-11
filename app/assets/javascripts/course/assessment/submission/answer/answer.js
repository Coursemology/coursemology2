(function($) {
  /* global Routes */
  'use strict';
  var DOCUMENT_SELECTOR = '.course-assessment-submission-submissions.edit ';


  /**
   * Gets the course ID for the given comment.
   *
   * @param {jQuery} $comment The comment to find the associated course for.
   * @return {Number} The ID for the course the element is associated with.
   */
  function courseIdForComment($comment) {
    var $course = $comment.parents('.course-layout:first');
    return $course.data('courseId');
  }

  /**
   * Gets the assessment ID for the given comment.
   *
   * @param {jQuery} $comment The comment to find the associated assessment for.
   * @return {Number} The ID for the assessment the element is associated with.
   */
  function assessmentIdForComment($comment) {
    var $assessment = $comment.parents('.assessment:first');
    return $assessment.data('assessmentId');
  }

  /**
   * Gets the submission ID for the given comment.
   *
   * @param {jQuery} $comment The comment to find the associated submission for.
   * @return {Number} The ID for the submission the element is associated with.
   */
  function submissionIdForComment($comment) {
    var $submission = $comment.parents('.submission:first');
    return $submission.data('submissionId');
  }

  /**
   * Gets the answer ID for the given comment.
   *
   * @param {jQuery} $comment The comment to find the associated answer for.
   * @return {Number} The ID for the answer the comment is associated with.
   */
  function answerIdForComment($comment) {
    var $answer = $comment.parents('.answer:first');
    return $answer.data('answerId');
  }

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
    var REPLY_COMMENT_SELECTOR = '.reply-annotation';
    $(element).find(REPLY_COMMENT_SELECTOR).addBack(REPLY_COMMENT_SELECTOR).show();
  }

  /**
   * Reveals widgets that enable user to use features with JavaScript functionality.
   *
   * @param element
   */
  function showScriptedWidgets(element) {
    showCommentToolbar(element);
    showReplyButton(element);
  }

  /**
   * Handles the comment delete button click event.
   *
   * @param e The event object.
   */
  function onCommentDelete(e) {
    var $element = $(e.target);

    var courseId = courseIdForComment($element);
    var assessmentId = assessmentIdForComment($element);
    var submissionId = submissionIdForComment($element);
    var answerId = answerIdForComment($element);
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
})(jQuery);
