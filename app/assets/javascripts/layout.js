(function() {
  'use strict';
  function initializeComponents(element) {
    $('[data-toggle="popover"]', element).popover();
    $('[title]', element).tooltip();
  }

  initializeComponents(document);
  $(document).on('DOMNodeInserted', function(e) {
    initializeComponents(e.target);
  });
  $(document).on('nested:fieldAdded', function(e) {
    initializeComponents(e.field);
  });
})();
