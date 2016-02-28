//= require templates/course/assessment/submission/answer/programming/add_annotation_button
//= require templates/course/assessment/submission/answer/programming/annotation_form

(function($) {
  /* global JST */
  'use strict';
  var DOCUMENT_SELECTOR = '.course-assessment-submission-submissions.edit ';

  /**
   * Renders a programming submission template.
   *
   * @param {String} template The relative path to the template. Absolute paths or paths
   *   beginning with a period are not expanded.
   * @param {Object} locals The local variables to be given to the template.
   * @return {String} The rendered template.
   */
  function render(template, locals) {
    if (template[0] !== '/' && template[0] !== '.') {
      template = 'templates/course/assessment/submission/answer/programming/' + template;
    }

    return JST[template](locals);
  }

  /**
   * Finds the annotation cell for the given line within the given code block. This will create
   * a cell if the cell cannot be found.
   *
   * @param {jQuery} $code The table containing the code block.
   * @param {Number} lineNumber The line number for the annotation.
   * @return {jQuery} The cell which was found or created.
   */
  function findOrCreateAnnotationCell($code, lineNumber) {
    var $cell = findAnnotationCell($code, lineNumber);
    if ($cell.length > 0) {
      return $cell;
    }

    var row = createAnnotationRow(lineNumber);
    findCodeLine($code, lineNumber).after(row);

    // Traverse again, so we get the inserted row instead of the disconnected row node.
    return findAnnotationCell($code, lineNumber);
  }

  /**
   * Creates an annotation row for the given line number.
   *
   * @param {Number} lineNumber The line number to create an annotation row for.
   * @return {String} The markup for the annotation row.
   */
  function createAnnotationRow(lineNumber) {
    return render('annotation_row', { lineNumber: lineNumber });
  }

  /**
   * Finds the table row representing the line content at the given line number.
   *
   * @param {jQuery} $code The table containing the code to search.
   * @returns {jQuery} The row containing the line content.
   */
  function findCodeLine($code, lineNumber) {
    return $code.find('td.line-number[data-line-number=' + lineNumber + ']').parent();
  }

  /**
   * Finds the annotation cell for the same file, at the given line number.
   *
   * @param {jQuery} $code The table containing the code to search.
   * @param {Number} lineNumber The line number.
   * @return {jQuery} If the cell was found.
   */
  function findAnnotationCell($code, lineNumber) {
    return $code.find('td.line-annotation[data-line-number="' + lineNumber + '"]');
  }

  /**
   * Adds the programming annotation links to every line of code.
   *
   * @param {HTMLElement} element The table containing the code, tabulated by lines. This is the
   *   output of the Ruby `format_code_block` helper.
   */
  function addProgrammingAnnotationLinks(element) {
    var $lineNumbers = $(DOCUMENT_SELECTOR + 'table.codehilite td.line-content', element).
      not(function() {
        return $(this).find('.add-annotation').length > 0;
      });

    $lineNumbers.prepend(render('add_annotation_button'));
  }

  /**
   * Handles the click event when the add annotation button is clicked.
   *
   * @param {Event} e The event object.
   */
  function onAddProgrammingAnnotation(e) {
    var $target = $(e.target);
    var $answer = $target.parents('.answer:first');
    var $programmingFile = $target.parents('.answer_programming_file');
    var $line = $target.parents('tr:first');

    var answerId = $answer.data('answerId');
    var programmingFileId = $programmingFile.data('programmingFileId');
    var lineNumber = $line.find('.line-number').data('lineNumber');

    var $code = $line.parents('table:first');
    findOrCreateAnnotationBox($code, answerId, programmingFileId, lineNumber);
  }

  /**
   * Creates a annotation box for the user to enter his annotation.
   *
   * @param {jQuery} $code The table containing the code to search.
   * @param {Number} answerId The answer ID that the annotation is associated with.
   * @param {Number} programmingFileId The programming answer file ID that the annotation is
   *   associated with.
   * @param {Number} lineNumber The line number that the user is annotating.
   * @return {jQuery} The annotation box which was found or created.
   */
  function findOrCreateAnnotationBox($code, answerId, programmingFileId, lineNumber) {
    var $annotationCell = findOrCreateAnnotationCell($code, lineNumber);
    var $annotationBox = findAnnotationBox($annotationCell);
    if ($annotationBox.length > 0) {
      return $annotationBox;
    }

    return createAnnotationBox($annotationCell, answerId, programmingFileId, lineNumber);
  }

  /**
   * Finds the annotation box in the given cell.
   *
   * @param {jQuery} $annotationCell The annotation cell to search for the form.
   * @return {jQuery} The annotation box which was found.
   */
  function findAnnotationBox($annotationCell) {
    return $annotationCell.find('div.annotation-form');
  }

  /**
   * Creates a annotation box for the user to enter his annotation.
   *
   * @param {jQuery} $annotationCell The annotation cell to search for the form.
   * @param {Number} answerId The answer ID that the annotation is associated with.
   * @param {Number} programmingFileId The programming answer file ID that the annotation is
   *   associated with.
   * @param {Number} lineNumber The line number that the user is annotating.
   * @return {jQuery} The annotation box which was created.
   */
  function createAnnotationBox($annotationCell, answerId, programmingFileId, lineNumber) {
    $annotationCell.append(render('annotation_form', {
      answerId: answerId,
      programmingFileId: programmingFileId,
      lineNumber: lineNumber
    }));

    return findAnnotationBox($annotationCell);
  }

  /**
   * Handles the reset of the annotation form.
   *
   * @param e The event object.
   */
  function onAnnotationFormResetted(e) {
    var $button = $(e.target);
    var $form = $button.parents('div[data-action]:first');

    $form.remove();
  }

  /**
   * Blocks the submission of the submission form if we click on a submit button within the
   * annotation form.
   *
   * @param e The event object.
   */
  function onAnnotationFormSubmitted(e) {
    var $button = $(e.target);
    var $form = $button.parents('div[data-action]:first');
    var action = $form.data('action');
    var method = $form.data('method');

    $.ajax({ url: action, method: method, data: buildFormData($form) }).
      done(function(data) { onAnnotationFormSubmitSuccess(data, $form[0]); }).
      fail(function(data) { onAnnotationFormSubmitFail(data, $form[0]); });

    findFormFields($form).prop('disabled', true);
    e.preventDefault();
  }

  /**
   * Finds the form fields in the given form.
   *
   * @param {jQuery} $form The form to search.
   * @param {String|undefined} selector The filter to apply on the returned fields.
   *
   * @returns {jQuery} The set of fields matching the filter.
   */
  function findFormFields($form, selector) {
    var $result = $form.find('textarea, input');
    if (selector) {
      $result = $result.filter(selector);
    }

    return $result;
  }

  /**
   * Builds the form data from the given form.
   *
   * This is a less sophisticated version of $.serialize() in that it only supports inputs and
   * textareas.
   *
   * @param {jQuery} $form The form being submitted.
   * @returns {Object} The form data to be submitted.
   */
  function buildFormData($form) {
    var $fields = findFormFields($form, ':not(:disabled)');
    var data = {
      authenticity_token: $(document).find('meta[name="csrf-token"]').attr('content')
    };
    $fields.each(function() {
      if (this.name === '') {
        return;
      }

      data[this.name] = $(this).val();
    });

    return data;
  }

  /**
   * Handles the successful annotation save event.
   *
   * @param {HTMLElement} form The form which was submitted
   */
  function onAnnotationFormSubmitSuccess(_, form) {
    $(form).remove();
  }

  /**
   * Handles the errored annotation save event.
   *
   * @param {HTMLElement} form The form which was submitted
   */
  function onAnnotationFormSubmitFail(_, form) {
    var $form = $(form);
    findFormFields($form).prop('disabled', false);
  }

  addProgrammingAnnotationLinks(document);
  $(document).on('DOMNodeInserted', function(e) {
    addProgrammingAnnotationLinks(e.target);
  });
  $(document).on('click', DOCUMENT_SELECTOR + 'table.codehilite .add-annotation',
    onAddProgrammingAnnotation);
  $(document).on('click', DOCUMENT_SELECTOR + '.annotation-form input[type="reset"]',
    onAnnotationFormResetted);
  $(document).on('click', DOCUMENT_SELECTOR + '.annotation-form input[type="submit"]',
    onAnnotationFormSubmitted);
})(jQuery);
