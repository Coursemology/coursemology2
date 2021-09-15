//= require helpers/event_helpers
//= require helpers/discussion/edit_post
//= require helpers/discussion/delete_post

var DISCUSSION_POST_HELPERS = (function (
  $,
  EVENT_HELPERS,
  EDIT_DISCUSSION_POST,
  DELETE_DISCUSSION_POST
) {
  /* global JST, Routes */
  "use strict";

  /**
   * Shows the comments toolbar for the discussion post.
   *
   * @param element
   */
  function showCommentToolbar(element, selector) {
    var $comments = $(".discussion_post", element)
      .addBack(".discussion_post")
      .filter(selector + "*");

    $comments.find(".toolbar").show();
  }

  /**
   * Initializes the toolbar so that the discussion post can be edited and deleted.
   *
   * @param {HTMLElement} element The base element to attach the event to.
   * @param {String} selector The selector for the specific discussion posts.
   */
  function initializeToolbar(element, selector) {
    $(document).ready(function () {
      showCommentToolbar(element, selector);
    });
    EVENT_HELPERS.onNodesInserted($(element), function (insertedElement) {
      showCommentToolbar(insertedElement, selector);
    });
    DELETE_DISCUSSION_POST.initializeToolbarElement(element, selector);
    EDIT_DISCUSSION_POST.initializeToolbarElement(element, selector);
  }

  return {
    initializeToolbar: initializeToolbar,
  };
})(jQuery, EVENT_HELPERS, EDIT_DISCUSSION_POST, DELETE_DISCUSSION_POST);
