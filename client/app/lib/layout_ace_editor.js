const ace = require('brace');

/* eslint wrap-iife: ["error", "inside"] */
/* eslint dot-notation: "warn" */
/* eslint no-param-reassign: "warn" */
/* global $:false, jQuery:false */

(function ($) {
  /**
   * Builds a new Ace editor container, with the given ID as a suffix.
   *
   * @param {String} id The ID to use as a suffix for the Ace editors.
   * @returns {jQuery}
   */
  function buildEditorContainer(id) {
    const $editor = $('<div></div>');
    $editor.css({
      display: 'none',
      position: 'relative',
    });
    $editor[0].id = `ace_${id}`;

    return $editor;
  }

  /**
   * Builds the editor within the given container.
   *
   * @param {jQuery} $container The container to build the editor in.
   * @param {Object} options The options for the editor.
   * @returns {Object} The Ace editor instance.
   */
  function buildEditor($container, options) {
    const editor = ace.edit($container[0]);
    editor.setTheme(`ace/theme/${options['theme']}`);
    editor.getSession().setMode(`ace/mode/${options['lang']}`);

    editor.setOptions({ readOnly: !!options.readOnly });

    return editor;
  }

  /**
   * Builds the Ace configuration object.
   *
   * @param {jQuery} $container The container for the Ace editor.
   * @param {Object} aceEditor The Ace editor created.
   * @returns {Object}
   */
  function buildAceOptions($container, aceEditor) {
    return {
      container: $container,
      editor: aceEditor,
    };
  }

  /**
   * Assigns the Ace configuration to the given element.
   *
   * @param {jQuery} $element The element which has the Ace editor associated with.
   * @param {jQuery} $container The container element for the Ace editor.
   * @param {Object} aceEditor The Ace editor created from `ace.edit`.
   */
  function assignEditor($element, $container, aceEditor) {
    $element.data('ace', buildAceOptions($container, aceEditor));
  }

  /**
   * Finds or builds an editor container from the given jQuery element.
   *
   * @param {jQuery} $element The element to find or build an Ace editor for.
   * @param {Object} options The options to use when building the element.
   * @returns {jQuery}
   */
  function findOrBuildEditorContainer($element, options) {
    const aceData = $element.data('ace');
    if (aceData) {
      return aceData.container;
    }

    const $container = buildEditorContainer($element[0].id);
    $container.insertAfter($element);
    $container.height($element.height());

    const editor = buildEditor($container, options);
    editor.on('change', () => {
      $element.val(editor.session.getValue());
    });
    editor.session.setValue($element.val());
    assignEditor($element, $container, editor);

    return $container;
  }

  /**
   * Redirects all labels from the old textarea to point to the new editor.
   * @param {jQuery} $from The textarea to redirect the labels from.
   * @param {jQuery} $editor The container for the Ace editor to redirect the labels to.
   */
  function reassignLabelsToAce($from, $editor) {
    const fromId = $from[0].id;
    const $editorTextarea = $('textarea.ace_text-input', $editor);
    $editorTextarea[0].id = `ace_textarea_${fromId}`;
    $(`label[for="${fromId}"]`).attr('for', $editorTextarea[0].id);
  }

  $.fn.ace = function (opt) {
    const options = $.extend({}, $.fn.ace.defaults, opt);

    return this.each(() => {
      const $this = $(this);
      const elementOptions = $.extend({}, options,
        { lang: $this[0].lang,
          readOnly: $this[0].readOnly });
      const $editor = findOrBuildEditorContainer($this, elementOptions);

      $this.hide();
      $editor.show();

      reassignLabelsToAce($this, $editor);
    });
  };

  $.fn.ace.defaults = {
    theme: 'github',
    lang: null,
  };
})(jQuery);
