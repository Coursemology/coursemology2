(function($) {
  'use strict';
  var DOCUMENT_SELECTOR = '.course-assessment-submission-submissions.edit ';

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
   * Handles the comment delete button click event.
   *
   * @param e The event object.
   */
  function onCommentDelete(e) {
    var $element = $(e.target);

    var answerId = answerIdForComment($element);
    var $post = $element.parents('.discussion_post:first');
    var postId = $post.data('postId');

    $.ajax({ url: 'answers/' + answerId + '/comments/' + postId, method: 'delete' }).
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

  showCommentToolbar(document);
  $(document).on('DOMNodeInserted', function(e) {
    showCommentToolbar(e.target);
  });
  $(document).on('click', DOCUMENT_SELECTOR + '.comments .discussion_post .toolbar .delete',
    onCommentDelete);
})(jQuery);
