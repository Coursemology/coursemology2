//= require helpers/discussion/delete_post

var DISCUSSION_POST_HELPERS = (function($, DELETE_DISCUSSION_POST) {
  /* global JST, Routes */
  'use strict';

  /**
   * Shows the comments toolbar for the discussion post.
   *
   * @param element
   */
  function showCommentToolbar(element, selector) {
    var $comments = $('.discussion_post', element).filter(selector + '*');
    $comments.find('.toolbar').show();
  }

  /**
   * Initializes the toolbar so that the discussion post can be deleted.
   *
   * @param {HTMLElement} element The base element to attach the event to.
   * @param {String} selector The selector for the specific discussion posts.
   */
  function initializeToolbar(element, selector) {
    showCommentToolbar(element, selector);
    $(document).on('DOMNodeInserted', function(e) {
      showCommentToolbar(e.target, selector);
    });
    DELETE_DISCUSSION_POST.initializeToolbarElement(element, selector);
  }

  return {
    initializeToolbar: initializeToolbar
  };
}(jQuery, DELETE_DISCUSSION_POST));
