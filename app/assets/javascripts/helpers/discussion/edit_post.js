//= require helpers/form_helpers
//= require helpers/course_helpers
//= require templates/course/discussion/post

var EDIT_DISCUSSION_POST = (function($, FORM_HELPERS,
                                        COURSE_HELPERS) {
  /* global JST, Routes */
  'use strict';

  var render = FORM_HELPERS.renderFromPath('templates/course/discussion/');

  /**
   * Handles the discussion post edit button click event.
   *
   * @param e The event object.
   */
  function onPostEdit(e) {
    var $element = $(e.target);
    var $post = $element.parents('.discussion_post:first');
    var $topic = $element.parents('.discussion_topic:first');

    var courseId = COURSE_HELPERS.courseIdForElement($element);
    var topicId = $topic.data('topicId');
    var postId = $post.data('postId');
    var postContent = $post.find('.content').html().trim();
    var postCommenter = $post.find('.user').html();

    $post.children().hide();
    var $form = findOrCreatePostForm($post, courseId, topicId, postId, postContent, postCommenter);
    e.preventDefault();
  }

  /**
   * Creates a form for the user to edit a discussion post.
   *
   * @param {jQuery} $element The element to search for the form.
   * @param {Number} courseId The course ID that the post is associated with.
   * @param {Number} topicId The topic ID that the post is associated with.
   * @param {Number} postId The ID of the post being edited.
   * @param {String} postContent The existing contents of the post's text field.
   * @param {HTMLElement} postCommenter The commenter's name with a link to his profile.
   * @return {jQuery} The annotation editing form which was found or created.
   */
  function findOrCreatePostForm($element, courseId, topicId, postId, postContent, postCommenter) {
    var $postForm = findPostForm($element);
    if ($postForm.length > 0) {
      return $postForm;
    }

    return createPostForm($element, courseId, topicId, postId, postContent, postCommenter);
  }

  /**
   * Creates a form for the user to edit his discussion post.
   *
   * @param {jQuery} $element The element to search for the form.
   * @param {Number} courseId The course ID that the post is associated with.
   * @param {Number} topicId The topic ID that the post is associated with.
   * @param {Number} postId The ID of the post being edited.
   * @param {String} postContent The existing contents of the post's text field.
   * @param {HTMLElement} postCommenter The commenter's name with a link to his profile.
   * @return {jQuery} The form for the annotation post.
   */
  function createPostForm($element, courseId, topicId, postId, postContent, postCommenter) {
    $element.append(render('post', {
      courseId: courseId,
      topicId: topicId,
      postId: postId,
      postContent: postContent,
      postCommenter: postCommenter
    }));

    return findPostForm($element);
  }

  /**
   * Finds the discussion post form in the given element
   *
   * @param {jQuery} $element The element to search for the form.
   * @return {jQuery} The discussion post form which was found.
   */
  function findPostForm($element) {
    return $element.find('> div.edit-discussion-post-form');
  }

  /**
   * Handles the submission of the discussion post edit form.
   *
   * @param e The event object.
   */
  function onPostFormSubmitted(e) {
    var $button = $(e.target);
    var $form = FORM_HELPERS.parentFormForElement($button);
    FORM_HELPERS.submitAndDisableForm($form, onPostFormSubmitSuccess,
                                             onPostFormSubmitFailure);
    e.preventDefault();
  }

  /**
   * Handles the resetting of the discussion post edit form.
   *
   * @param e The event object.
   */
  function onPostFormReset(e) {
    var $button = $(e.target);
    var $post = $button.parents('.discussion_post:first');

    FORM_HELPERS.removeParentForm($button);
    $post.children().show();
  }

  /**
   * Handles the successful discussion post save event.
   */
  function onPostFormSubmitSuccess() {
  }

  /**
   * Handles the errored discussion post save event.
   *
   * @param {HTMLElement} form The form which was submitted
   */
  function onPostFormSubmitFailure(_, form) {
    FORM_HELPERS.enableForm($(form));

    // TODO: Implement error recovery.
  }

  // TODO
  function initializeToolbarElement(element, selector) {
    $(element).on('click', selector + '.edit-discussion-post-form input[type="reset"]',
      onPostFormReset);
    $(element).on('click', selector + '.edit-discussion-post-form input[type="submit"]',
      onPostFormSubmitted);
    $(element).on('click', selector + '.discussion_post .toolbar .edit',
      onPostEdit);
  }

  return {
    initializeToolbarElement: initializeToolbarElement
  };
}(jQuery, FORM_HELPERS,
          COURSE_HELPERS));
