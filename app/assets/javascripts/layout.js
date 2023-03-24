(function ($) {
  'use strict';

  function initializeComponents(element) {
    $('[data-toggle="popover"]', element).popover();
    // Tooltips are attached to elements with a title attribute, except for the Facebook button.
    // See https://github.com/Coursemology/coursemology-theme/pull/5
    $('[title]', element).not('.fb-like *').tooltip();
  }

  // Queue component initialisation until the script has completely loaded.
  //
  // This prevents missing definitions for things like Ace themes, which are loaded after the
  // application script.
  $(function () {
    initializeComponents(document);

    $(document).on('nested:fieldAdded', function (e) {
      initializeComponents(e.field);
    });
  });
})(jQuery);
