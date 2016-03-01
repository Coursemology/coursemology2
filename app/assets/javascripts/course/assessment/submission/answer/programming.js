//= require templates/course/assessment/submission/answer/programming/add_annotation_button
//= require templates/course/assessment/submission/answer/programming/annotation_form

(function($) {
  /* global JST, Routes */
  'use strict';
  var DOCUMENT_SELECTOR = '.course-assessment-submission-submissions.edit ' +
    'div.answer_programming_file ';

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
   * @param {Number} programmingFileId The programming file which the annotation refers to.
   * @param {Number} lineNumber The line number for the annotation.
   * @return {jQuery} The cell which was found or created.
   */
  function findOrCreateAnnotationCell($code, programmingFileId, lineNumber) {
    var $cell = findAnnotationCell($code, programmingFileId, lineNumber);
    if ($cell.length > 0) {
      return $cell;
    }

    var row = createAnnotationRow(programmingFileId, lineNumber);
    findCodeLine($code, lineNumber).after(row);

    // Traverse again, so we get the inserted row instead of the disconnected row node.
    return findAnnotationCell($code, programmingFileId, lineNumber);
  }

  /**
   * Creates an annotation row for the given line number.
   *
   * @param {Number} lineNumber The line number to create an annotation row for.
   * @param {Number} programmingFileId The programming file which the annotation refers to.
   * @return {String} The markup for the annotation row.
   */
  function createAnnotationRow(programmingFileId, lineNumber) {
    return render('annotation_row', {
      annotationCellId: fileLineAnnotationCellId(programmingFileId, lineNumber),
      lineNumber: lineNumber
    });
  }

  /**
   * Creates the annotation cell ID for the given file and line number.
   *
   * This is the JavaScript port of
   * `Course::Assessment::Answer::ProgrammingHelper#file_line_annotation_cell_id`.
   *
   * @param {Number} lineNumber The line number to create an annotation row for.
   * @param {Number} programmingFileId The programming file which the annotation refers to.
   * @return {String} The ID for the given annotation cell.
   */
  function fileLineAnnotationCellId(programmingFileId, lineNumber) {
    return 'line_annotation_file_' + programmingFileId + '_line_' + lineNumber + '_annotation';
  }

  /**
   * Finds the table row representing the line content at the given line number.
   *
   * @param {jQuery} $code The table containing the code to search.
   * @param {Number} lineNumber The line number to search for.
   * @returns {jQuery} The row containing the line content.
   */
  function findCodeLine($code, lineNumber) {
    return $code.find('td.line-number[data-line-number=' + lineNumber + ']').parent();
  }

  /**
   * Finds the annotation cell for the same file, at the given line number.
   *
   * @param {jQuery} $code The table containing the code to search.
   * @param {Number} programmingFileId The programming file which the annotation refers to.
   * @param {Number} lineNumber The line number.
   * @return {jQuery} If the cell was found.
   */
  function findAnnotationCell($code, programmingFileId, lineNumber) {
    return $code.find('td#line_annotation_file_' + programmingFileId + '_line_' + lineNumber +
                      '_annotation');
  }

  /**
   * Gets the course ID for the given element.
   *
   * @param {jQuery} $element The element to find the associated course for.
   * @return {Number} The ID for the course the element is associated with.
   */
  function courseIdForElement($element) {
    var $course = $element.parents('.course-layout:first');
    return $course.data('courseId');
  }

  /**
   * Gets the assessment ID for the given element.
   *
   * @param {jQuery} $element The element to find the associated assessment for.
   * @return {Number} The ID for the assessment the element is associated with.
   */
  function assessmentIdForElement($element) {
    var $assessment = $element.parents('.assessment:first');
    return $assessment.data('assessmentId');
  }

  /**
   * Gets the submission ID for the given element.
   *
   * @param {jQuery} $element The element to find the associated submission for.
   * @return {Number} The ID for the submission the element is associated with.
   */
  function submissionIdForElement($element) {
    var $submission = $element.parents('.submission:first');
    return $submission.data('submissionId');
  }

  /**
   * Gets the answer ID for the given row within the code listing table.
   *
   * @param {jQuery} $element The element to find the associated answer for.
   * @return {Number} The ID for the answer the line is associated with.
   */
  function answerIdForRow($element) {
    var $answer = $element.parents('.answer:first');
    return $answer.data('answerId');
  }

  /**
   * Gets the programming file ID for the given row within the code listing table.
   *
   * @param {jQuery} $element The element to find the associated answer for.
   * @return {Number} The ID for the programming file the line is associated with.
   */
  function programmingFileIdForRow($element) {
    var $programmingFile = $element.parents('.answer_programming_file');
    return $programmingFile.data('programmingFileId');
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
    var $line = $target.parents('tr:first');

    var courseId = courseIdForElement($target);
    var assessmentId = assessmentIdForElement($target);
    var submissionId = submissionIdForElement($target);
    var answerId = answerIdForRow($target);
    var programmingFileId = programmingFileIdForRow($target);
    var lineNumber = $line.find('.line-number').data('lineNumber');

    var $code = $line.parents('table:first');
    var $cell = findOrCreateAnnotationCell($code, programmingFileId, lineNumber);
    findOrCreateAnnotationForm($cell, courseId, assessmentId, submissionId, answerId,
                               programmingFileId, lineNumber);
  }

  /**
   * Creates a annotation form for the user to enter his annotation.
   *
   * @param {jQuery} $element The element to search for the form.
   * @param {Number} courseId The course ID that the annotation is associated ith.
   * @param {Number} assessmentId The assessment ID that the annotation is associated with.
   * @param {Number} submissionId The submission ID that the annotation is associated with.
   * @param {Number} answerId The answer ID that the annotation is associated with.
   * @param {Number} programmingFileId The programming answer file ID that the annotation is
   *   associated with.
   * @param {Number} lineNumber The line number that the user is annotating.
   * @param {Number} parentId The parent post ID that the annotation will be associated with.
   * @return {jQuery} The annotation form which was found or created.
   */
  function findOrCreateAnnotationForm($element, courseId, assessmentId, submissionId, answerId,
                                      programmingFileId, lineNumber, parentId) {
    var $annotationForm = findAnnotationForm($element);
    if ($annotationForm.length > 0) {
      return $annotationForm;
    }

    return createAnnotationForm($element, courseId, assessmentId, submissionId, answerId,
                                programmingFileId, lineNumber, parentId);
  }

  /**
   * Finds the annotation form in the given cell.
   *
   * @param {jQuery} $element The annotation cell to search for the form.
   * @return {jQuery} The annotation form which was found.
   */
  function findAnnotationForm($element) {
    return $element.find('> div.annotation-form');
  }

  /**
   * Creates a annotation form for the user to enter his annotation.
   *
   * @param {jQuery} $element The element to search for the form.
   * @param {Number} courseId The course ID that the annotation is associated with.
   * @param {Number} assessmentId The assessment ID that the annotation is associated with.
   * @param {Number} submissionId The submission ID that the annotation is associated with.
   * @param {Number} answerId The answer ID that the annotation is associated with.
   * @param {Number} programmingFileId The programming answer file ID that the annotation is
   *   associated with.
   * @param {Number} lineNumber The line number that the user is annotating.
   * @param {Number} parentId The parent post ID that the annotation will be associated with.
   * @return {jQuery} The annotation form which was created.
   */
  function createAnnotationForm($element, courseId, assessmentId, submissionId, answerId,
                                programmingFileId, lineNumber, parentId) {
    $element.append(render('annotation_form', {
      courseId: courseId,
      assessmentId: assessmentId,
      submissionId: submissionId,
      answerId: answerId,
      programmingFileId: programmingFileId,
      lineNumber: lineNumber,
      parentId: parentId
    }));

    return findAnnotationForm($element);
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

    // TODO: Implement error recovery.
  }

  /**
   * Handles the annotation delete button click event.
   *
   * @param e The event object.
   */
  function onAnnotationDelete(e) {
    var $element = $(e.target);

    var courseId = courseIdForElement($element);
    var assessmentId = assessmentIdForElement($element);
    var submissionId = submissionIdForElement($element);
    var answerId = answerIdForRow($element);
    var programmingFileId = programmingFileIdForRow($element);
    var lineNumber = $element.parents('.line-annotation:first').data('lineNumber');

    var $post = $element.parents('.discussion_post:first');
    var postId = $post.data('postId');

    $.ajax({ url: Routes.course_assessment_submission_answer_programming_file_line_post_path(
                    courseId, assessmentId, submissionId, answerId, programmingFileId, lineNumber,
                    postId),
             method: 'delete' }).
      done(function(data) { onAnnotationDeleteSuccess(data, $element); }).
      fail(function(data) { onAnnotationDeleteFail(data, $element); });
    e.preventDefault();
  }

  /**
   * Handles the successful annotation delete event.
   */
  function onAnnotationDeleteSuccess() {
  }

  /**
   * Handles the errored annotation delete event.
   */
  function onAnnotationDeleteFail() {
    // TODO: Implement error recovery.
  }

  /**
   * Handles the annotation reply button click event.
   *
   * @param e The event object.
   */
  function onAnnotationReply(e) {
    var $element = $(e.target);
    var $post = $element.parents('.discussion_post:first');
    var $replies = $post.next('div.replies');

    var courseId = courseIdForElement($element);
    var assessmentId = assessmentIdForElement($element);
    var submissionId = submissionIdForElement($element);
    var answerId = answerIdForRow($element);
    var programmingFileId = programmingFileIdForRow($element);
    var lineNumber = $element.parents('.line-annotation:first').data('lineNumber');
    var postId = $post.data('postId');

    var $form = findOrCreateAnnotationForm($replies, courseId, assessmentId, submissionId, answerId,
                                           programmingFileId, lineNumber, postId);
    $form.find('textarea').focus();
    e.preventDefault();
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
  $(document).on('click', DOCUMENT_SELECTOR + '.discussion_post .toolbar .delete',
    onAnnotationDelete);
  $(document).on('click', DOCUMENT_SELECTOR + '.discussion_post .toolbar .reply',
    onAnnotationReply);
})(jQuery);
