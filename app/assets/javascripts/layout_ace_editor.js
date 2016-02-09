(function($) {
  'use strict';

  /**
   * Builds a new Ace editor container, with the given ID as a suffix.
   *
   * @param {String} id The ID to use as a suffix for the Ace editors.
   * @returns {jQuery}
   */
  function buildEditorContainer(id) {
    var $editor = $('<div></div>');
    $editor.css({
      'display': 'none',
      'position': 'relative'
    });
    $editor[0].id = 'ace_' + id;

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
    var editor = ace.edit($container[0]);
    editor.setTheme('ace/theme/' + options['theme']);
    editor.getSession().setMode('ace/mode/' + options['lang']);

    return editor;
  }

  /**
   * Builds the Ace configuration object.
   *
   * @param {jQuery} $container The container for the Ace editor.
   * @param {Object} ace The Ace editor created.
   * @returns {Object}
   */
  function buildAceOptions($container, ace) {
    return {
      'container': $container,
      'editor': ace
    };
  }

  /**
   * Assigns the Ace configuration to the given element.
   *
   * @param {jQuery} $element The element which has the Ace editor associated with.
   * @param {jQuery} $container The container element for the Ace editor.
   * @param {Object} ace The Ace editor created from `ace.edit`.
   */
  function assignEditor($element, $container, ace) {
    $element.data('ace', buildAceOptions($container, ace));
  }

  /**
   * Finds or builds an editor container from the given jQuery element.
   *
   * @param {jQuery} $element The element to find or build an Ace editor for.
   * @param {Object} options The options to use when building the element.
   * @returns {jQuery}
   */
  function findOrBuildEditorContainer($element, options) {
    var aceData = $element.data('ace');
    if (aceData) {
      return aceData['container'];
    }

    var $container = buildEditorContainer($element[0].id);
    $container.insertAfter($element);
    $container.height($element.height());

    var editor = buildEditor($container, options);
    editor.on('change', function() {
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
    var fromId = $from[0].id;
    var $editorTextarea = $('textarea.ace_text-input', $editor);
    var editorTextareaId = $editorTextarea[0].id = 'ace_textarea_' + fromId;
    $('label[for="' + fromId + '"]').attr('for', editorTextareaId);
  }

  $.fn.ace = function(options) {
    options = $.extend({}, $.fn.ace.defaults, options);

    return this.each(function() {
      var $this = $(this);
      var elementOptions = $.extend({}, options, { 'lang': $this[0].lang });
      var $editor = findOrBuildEditorContainer($this, elementOptions);

      $this.hide();
      $editor.show();

      reassignLabelsToAce($this, $editor);
    });
  };

  $.fn.ace.defaults = {
    'theme': 'github',
    'lang': null
  };
})(jQuery);
