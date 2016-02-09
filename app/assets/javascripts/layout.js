//= require layout_ace_editor

(function($) {
  'use strict';
  function initializeComponents(element) {
    $('[data-toggle="popover"]', element).popover();
    $('[title]', element).tooltip();
    $('textarea.code', element).ace();
  }

  initializeComponents(document);
  $(document).on('DOMNodeInserted', function(e) {
    initializeComponents(e.target);
  });
  $(document).on('nested:fieldAdded', function(e) {
    initializeComponents(e.field);
  });
})(jQuery);
