//= require helpers/event_helpers
//= require layout_ace_editor
//= require layout_checkbox_toggle_all

(function($, EVENT_HELPERS) {
  'use strict';

  function compressImage(image, onImageCompressed) {
    // Maximum image size, images larger than this will be compressed
    var IMAGE_MAX_WIDTH = 1920;
    var IMAGE_MAX_HEIGHT = 1080;

    var reader = new FileReader();
    reader.onload = function(e) {
      var img = document.createElement('img');
      var canvas = document.createElement('canvas');

      img.src = e.target.result;
      var width = img.width;
      var height = img.height;

      if (width <= IMAGE_MAX_WIDTH && height <= IMAGE_MAX_HEIGHT ) {
       onImageCompressed(e.target.result);
       return;
      }
      if (width > IMAGE_MAX_WIDTH) {
        height *= IMAGE_MAX_WIDTH / width;
        width = IMAGE_MAX_WIDTH;
      }
      if (height > IMAGE_MAX_HEIGHT) {
        width *= IMAGE_MAX_HEIGHT / height;
        height = IMAGE_MAX_HEIGHT;
      }

      canvas.width = width;
      canvas.height = height;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      onImageCompressed(canvas.toDataURL('image/jpeg'));
    };
    reader.readAsDataURL(image);
  }

  // Initialises Summernote
  //   Function applies config options to summernote based on CSS classes applied in 'textarea'.
  //   Currently supported options include `airmode` and `focus`.
  function initializeSummernote(element) {
    var airmodeOptions = $.extend(true, { airMode: true },
                                        { popover: $.summernote.options.popover });
    airmodeOptions.popover.air.unshift(['style', ['style']]);

    $('textarea.text').not('.summernote-initialised').each(function(){
      var $summernote = $(this);
      function onImageCompressed(dataUrl) {
        var img = document.createElement('img');
        img.src = dataUrl;
        $summernote.summernote('insertNode', img);
      }

      var options = {
        toolbar: [
          ['paragraph-style', ['style']],
          ['font-style', ['bold', 'underline', 'clear']],
          ['font-script', ['superscript', 'subscript']],
          ['font-name', ['fontname']],
          ['color', ['color']],
          ['paragraph', ['ul', 'ol', 'paragraph']],
          ['table', ['table']],
          ['insert', ['link', 'picture', 'video']],
          ['misc', ['fullscreen', 'codeview', 'help']],
        ],
        callbacks: {
          onImageUpload: function(files) {
            for (var i = 0; i < files.length; i++) {
              compressImage(files[i], onImageCompressed);
            }
          }
        }
      };

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
