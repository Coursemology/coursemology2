//= require helpers/course_helpers
//= require routes

var DELETE_DISCUSSION_POST = (function ($, COURSE_HELPERS, ROUTES) {
  /* global JST, Routes */
  "use strict";

  /**
   * Handles the discussion post delete button click event.
   *
   * @param e The event object.
   */
  function onPostDelete(e) {
    var $element = $(e.target);
    var $post = $element.parents(".discussion_post:first");
    var $topic = $element.parents(".discussion_topic:first");

    var courseId = COURSE_HELPERS.courseIdForElement($element);
    var topicId = $topic.data("topicId");
    var postId = $post.data("postId");

    $.ajax({
      url: ROUTES.course_topic_post_path(courseId, topicId, postId),
      method: "delete",
    })
      .done(function (data) {
        onPostDeleteSuccess(data, $element);
      })
      .fail(function (data) {
        onPostDeleteFailure(data, $element);
      });
    e.preventDefault();
  }

  /**
   * Handles the successful discussion post delete event.
   */
  function onPostDeleteSuccess() {}

  /**
   * Handles the errored discussion post delete event.
   */
  function onPostDeleteFailure() {
    // TODO: Implement error recovery.
  }

  /**
   * Allow discussion post to be deleted when the delete button in its toolbar is clicked.
   *
   * @param {HTMLElement} element The base element to attach the event to.
   * @param {String} selector The selector for the specific discussion posts.
   */
  function initializeToolbarElement(element, selector) {
    $(element).on(
      "click",
      selector + ".discussion_post .toolbar .delete",
      onPostDelete
    );
  }

  return {
    initializeToolbarElement: initializeToolbarElement,
  };
})(jQuery, COURSE_HELPERS, ROUTES);
