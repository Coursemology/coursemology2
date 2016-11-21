//= require helpers/event_helpers
//= require layout_ace_editor
//= require layout_checkbox_toggle_all

(function($, EVENT_HELPERS) {
  'use strict';

  // Initialises Summernote
  //   Function applies config options to summernote based on CSS classes applied in 'textarea'.
  //   Currently supported options include `airmode` and `focus`.
  function initializeSummernote(element) {
    var airmodeOptions = $.extend(true, { airMode: true },
                                        { popover: $.summernote.options.popover });
    airmodeOptions.popover.air.unshift(['style', ['style']]);

    $('textarea.text').not('.summernote-initialised').each(function(){
      var options = {};
      if ($(this).hasClass('airmode')) {
        options = $.extend(true, options, airmodeOptions);
      }
      if ($(this).hasClass('focus')) {
        options = $.extend(true, options, { focus: true} );
      }
      $(this).summernote(options);
      $(this).addClass('summernote-initialised');
    });
  }

  function initializeComponents(element) {
    $('[data-toggle="popover"]', element).popover();
    // Tooltips are attached to elements with a title attribute, except for the Facebook button.
    // See https://github.com/Coursemology/coursemology-theme/pull/5
    $('[title]', element).not('.fb-like *').tooltip();
    $('input.toggle-all[type="checkbox"]', element).checkboxToggleAll();
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
