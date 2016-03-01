(function($) {
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

  showCommentToolbar(document);
  $(document).on('DOMNodeInserted', function(e) {
    showCommentToolbar(e.target);
  });
})(jQuery);
