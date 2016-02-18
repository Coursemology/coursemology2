//= require layout_ace_editor

(function($) {
  'use strict';
  function initializeComponents(element) {
    $('[data-toggle="popover"]', element).popover();
    $('[title]', element).tooltip();
    $('textarea.code', element).ace();
  }

  // Queue component initialisation until the script has completely loaded.
  //
  // This prevents missing definitions for things like Ace themes, which are loaded after the
  // application script.
  setTimeout(function() { initializeComponents(document); }, 0);

  $(document).on('DOMNodeInserted', function(e) {
    initializeComponents(e.target);
  });
  $(document).on('nested:fieldAdded', function(e) {
    initializeComponents(e.field);
  });
})(jQuery);
