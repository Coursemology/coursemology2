//= require helpers/event_helpers
//= require layout_checkbox_toggle_all

(function ($, EVENT_HELPERS) {
  "use strict";

  function inlineCodeButton() {
    var ui = $.summernote.ui;

    var button = ui.button({
      contents:
        '<i class="fa fa-code"' +
        'style="color: #c7254e;' +
        "font-weight: bold;" +
        'background-color: #f9f2f4"/>',
      tooltip: "Inline Code",
      click: function () {
        var node = $(
          window.getSelection().getRangeAt(0).commonAncestorContainer
        );
        var smrNote = node
          .closest(".note-editor")
          .prev(".summernote-initialised");
        if (node.parent().is("code")) {
          node.unwrap();
        } else {
          var range = smrNote.summernote("editor.createRange"),
            text = range.toString();
          if (text !== "") {
            var newNode = $("<code></code>").eq(0);
            newNode.text(text);
            smrNote.summernote("editor.insertNode", newNode.get(0));
          }
        }
      },
    });

    return button.render();
  }

  function uploadImage(image, onImageUploaded) {
    var formData = new FormData();
    formData.append("file", image);
    formData.append("name", image.name);

    $.ajax({
      url: "/attachments",
      type: "POST",
      data: formData,
      contentType: false,
      processData: false,
      success: function (data) {
        if (data.success) {
          onImageUploaded(data.id);
        }
      },
    });
  }

  // Initialises Summernote
  //   Function applies config options to summernote based on CSS classes applied in 'textarea'.
  //   Currently supported options include `airmode` and `focus`.
  function initializeSummernote(element) {
    var airmodeOptions = {
      airMode: true,
      popover: {
        air: [
          ["style", ["style"]],
          ["font", ["bold", "underline", "inlineCode", "clear"]],
          ["script", ["superscript", "subscript"]],
          ["color", ["color"]],
          ["para", ["ul", "ol", "paragraph"]],
          ["table", ["table"]],
          ["insert", ["link", "picture"]],
        ],
      },
    };

    var airmodeOptionsNoPalette = {
      airMode: true,
      popover: {
        air: [
          ["style", ["style"]],
          ["font", ["bold", "underline", "inlineCode", "clear"]],
          ["script", ["superscript", "subscript"]],
          ["para", ["ul", "ol", "paragraph"]],
          ["table", ["table"]],
          ["insert", ["link", "picture"]],
        ],
      },
    };

    $("textarea.text")
      .not(".summernote-initialised")
      .not(".no-summernote")
      .each(function () {
        var $summernote = $(this);
        function onImageUploaded(id) {
          $summernote.summernote("insertImage", "/attachments/" + id);
        }

        var options = {
          toolbar: [
            ["style", ["style"]],
            ["font", ["bold", "underline", "inlineCode", "clear"]],
            ["script", ["superscript", "subscript"]],
            ["fontname", ["fontname"]],
            ["color", ["color"]],
            ["para", ["ul", "ol", "paragraph"]],
            ["table", ["table"]],
            ["insert", ["link", "picture", "video"]],
            ["view", ["fullscreen", "codeview", "help"]],
          ],
          popover: {
            image: [
              ["imagesize", ["imageSize100", "imageSize50", "imageSize25"]],
              ["remove", ["removeMedia"]],
            ],
          },
          callbacks: {
            onImageUpload: function (files) {
              for (var i = 0; i < files.length; i++) {
                uploadImage(files[i], onImageUploaded);
              }
            },
          },
          buttons: {
            inlineCode: inlineCodeButton,
          },
          followingToolbar: false,
        };

        if ($(this).hasClass("airmode")) {
          // Rendering color palette takes a very long time.
          if ($(this).hasClass("no-color-palette")) {
            options = $.extend(true, options, airmodeOptionsNoPalette);
          } else {
            options = $.extend(true, options, airmodeOptions);
          }
        }

        if ($(this).hasClass("focus")) {
          options = $.extend(true, options, { focus: true });
        }
        $(this).summernote(options);
        $(this).addClass("summernote-initialised");
      });
  }

  function initializeComponents(element) {
    $('[data-toggle="popover"]', element).popover();
    // Tooltips are attached to elements with a title attribute, except for the Facebook button.
    // See https://github.com/Coursemology/coursemology-theme/pull/5
    $("[title]", element).not(".fb-like *").tooltip();
    $('input.toggle-all[type="checkbox"]', element).checkboxToggleAll();
    initializeSummernote(element);
  }

  // Queue component initialisation until the script has completely loaded.
  //
  // This prevents missing definitions for things like Ace themes, which are loaded after the
  // application script.
  $(document).ready(function () {
    initializeComponents(document);

    EVENT_HELPERS.onNodesInserted($(document), initializeComponents);

    $(document).on("nested:fieldAdded", function (e) {
      initializeComponents(e.field);
    });
  });
})(jQuery, EVENT_HELPERS);
