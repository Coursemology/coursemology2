(function($) {
  'use strict';
  var DOCUMENT_SELECTOR = '.course-discussion-topics.index ';

  // The comment boxes are hidden by default, show the boxes if the browser supports javascript.
  function showCommentBoxes() {
    var $forms = $('.post-form').filter(DOCUMENT_SELECTOR + '*');
    $forms.show();
  }

  function onPostFormSubmit(e) {
    e.preventDefault();

    var $form = $(e.target);
    var action = $form.attr('action');
    var method = $form.attr('method');

    $.ajax({ url: action, method: method, data: $form.serialize() }).
    fail(function(data) { onPostFormSubmitFail(data, $form[0]); });

    findInputFields($form).prop('disabled', true);
  }

  function onPostFormSubmitFail(_, form) {
    var $form = $(form);
    findInputFields($form).prop('disabled', false);

    // TODO: Display error messages.
  }

  function findInputFields($form) {
    return $form.find('textarea, input');
  }

  $(document).on('page:load ready', showCommentBoxes);
  $(document).on('submit', DOCUMENT_SELECTOR + '.post-form', onPostFormSubmit);
})(jQuery);
