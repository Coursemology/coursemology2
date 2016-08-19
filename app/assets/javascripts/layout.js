//= require helpers/event_helpers
//= require layout_ace_editor
//= require layout_checkbox_toggle_all

(function($, EVENT_HELPERS) {
  'use strict';

  function initializeSummernote(element) {
    var airmodeOptions = $.extend(true, { airMode: true },
                                        { popover: $.summernote.options.popover });
    airmodeOptions.popover.air.unshift(['style', ['style']]);
    $('textarea.text.airmode', element).summernote(airmodeOptions);
    $('textarea.text', element).summernote();
  }

  function initializeComponents(element) {
    $('[data-toggle="popover"]', element).popover();
    $('[title]', element).tooltip();
    $('input.toggle-all[type="checkbox"]', element).checkboxToggleAll();
    $('textarea.code', element).ace();
    initializeSummernote(element);
  }

  // Queue component initialisation until the script has completely loaded.
  //
  // This prevents missing definitions for things like Ace themes, which are loaded after the
  // application script.
  setTimeout(function() { initializeComponents(document); }, 0);

  EVENT_HELPERS.onNodesInserted($(document), initializeComponents);
  $(document).on('nested:fieldAdded', function(e) {
    initializeComponents(e.field);
  });
})(jQuery, EVENT_HELPERS);
