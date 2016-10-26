//= require helpers/event_helpers
//= require layout_ace_editor
//= require layout_checkbox_toggle_all

(function($, EVENT_HELPERS) {
  'use strict';

  function initializeSummernote(element) {
    var airmodeOptions = $.extend(true, { airMode: true },
                                        { popover: $.summernote.options.popover });
    airmodeOptions.popover.air.unshift(['style', ['style']]);
    var airmodeTextareas = $('textarea.text.airmode', element).not('.summernote-initialised');
    airmodeTextareas.summernote(airmodeOptions);
    airmodeTextareas.addClass('summernote-initialised');

    var textareas = $('textarea.text', element).not('.airmode').not('.summernote-initialised');
    textareas.summernote();
    textareas.addClass('summernote-initialised');
  }

  function initializeComponents(element) {
    $('[data-toggle="popover"]', element).popover();
    // Tooltips are attached to elements with a title attribute, except for the Facebook button.
    // See https://github.com/Coursemology/coursemology-theme/pull/5
    $('[title]', element).not('.fb-like *').tooltip();
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
