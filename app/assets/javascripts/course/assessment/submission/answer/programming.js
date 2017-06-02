//= require helpers/form_helpers
//= require helpers/course_helpers
//= require helpers/answer_helpers
//= require helpers/event_helpers
//= require helpers/discussion/post_helpers
//= require templates/course/assessment/submission/answer/programming/add_annotation_button
//= require templates/course/assessment/submission/answer/programming/annotation_form

(function($, FORM_HELPERS,
             COURSE_HELPERS,
             ANSWER_HELPERS,
             EVENT_HELPERS,
             DISCUSSION_POST_HELPERS) {
  /* global JST, Routes */
  'use strict';
  var DOCUMENT_SELECTOR = '.course-assessment-submission-submissions.edit ' +
    'div.answer_programming_file ';
  var render = FORM_HELPERS.renderFromPath('templates/course/assessment/submission/answer/programming/');

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

    var courseId = COURSE_HELPERS.courseIdForElement($target);
    var assessmentId = ANSWER_HELPERS.assessmentIdForElement($target);
    var submissionId = ANSWER_HELPERS.submissionIdForElement($target);
    var answerId = ANSWER_HELPERS.answerIdForElement($target);
    var programmingFileId = programmingFileIdForRow($target);
    var $lineNumberCell = $line.find('.line-number:first');
    var lineNumber = $lineNumberCell.data('lineNumber');

    var $code = $line.parents('table:first');
    var $cell = findOrCreateAnnotationCell($code, programmingFileId, lineNumber);
    findOrCreateAnnotationForm($cell, courseId, assessmentId, submissionId, answerId,
                               programmingFileId, lineNumber);

    if ($lineNumberCell.children('.line-annotation-trigger').length === 0) {
      $lineNumberCell.replaceWith(render('line_number_cell', {lineNumber: lineNumber}));
    }

    $line.find('.collapse-annotation').click();
  }

  /**
   * Creates an annotation form for the user to enter his annotation.
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
   * @param {Boolean} focus Whether to focus the annotation form if it is to be created.
   * @return {jQuery} The annotation form which was found or created.
   */
  function findOrCreateAnnotationForm($element, courseId, assessmentId, submissionId, answerId,
                                      programmingFileId, lineNumber, parentId, focus) {
    var $annotationForm = findAnnotationForm($element);
    if ($annotationForm.length > 0) {
      return $annotationForm;
    }

    return createAnnotationForm($element, courseId, assessmentId, submissionId, answerId,
                                programmingFileId, lineNumber, parentId, focus);
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
   * Creates an annotation form for the user to enter his annotation.
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
                                programmingFileId, lineNumber, parentId, focus) {
    $element.append(render('annotation_form', {
      courseId: courseId,
      assessmentId: assessmentId,
      submissionId: submissionId,
      answerId: answerId,
      programmingFileId: programmingFileId,
      lineNumber: lineNumber,
      parentId: parentId,
      focus: focus
    }));

    return findAnnotationForm($element);
  }

  /**
   * Handles the reset of the annotation form. Removes the annotation row if there are no more
   * discussion within this annotation.
   *
   * @param e The event object.
   */
  function onAnnotationFormResetted(e) {
    var $button = $(e.target);
    var $annotationRow = $button.parents('tr:first');
    var $replyButton = $annotationRow.find('.reply-annotation');

    if ($annotationRow.find('.discussion_topic').length === 0) {
      $annotationRow.prev().find('.line-annotation-trigger').remove();
      $annotationRow.remove();
    } else {
      FORM_HELPERS.removeParentForm($button);
      $replyButton.show();
    }
  }

  /**
   * Blocks the submission of the submission form if we click on a submit button within the
   * annotation form.
   *
   * @param e The event object.
   */
  function onAnnotationFormSubmitted(e) {
    var $button = $(e.target);
    var $form = FORM_HELPERS.parentFormForElement($button);
    FORM_HELPERS.submitAndDisableForm($form, onAnnotationFormSubmitSuccess,
                                             onAnnotationFormSubmitFail);
    e.preventDefault();
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
    FORM_HELPERS.enableForm($(form));
    // TODO: Implement error recovery.
  }

  /**
   * Creates a form to reply to a given annotation post. By default, form creation will also
   * result in automatic focus on the form.
   *
   * @param {jQuery} $post The annotation post to reply to.
   */
  function findOrCreateAnnotationReplyFormForPost($post) {
    var $replies = $post.next('div.replies');
    var courseId = COURSE_HELPERS.courseIdForElement($post);
    var assessmentId = ANSWER_HELPERS.assessmentIdForElement($post);
    var submissionId = ANSWER_HELPERS.submissionIdForElement($post);
    var answerId = ANSWER_HELPERS.answerIdForElement($post);
    var programmingFileId = programmingFileIdForRow($post);
    var lineNumber = $post.parents('.line-annotation:first').data('lineNumber');
    var postId = $post.data('postId');

    return findOrCreateAnnotationForm($replies, courseId, assessmentId, submissionId, answerId,
                                      programmingFileId, lineNumber, postId, true);
  }

  /**
   * Handles the annotation reply button click event. Replying to an annotation is
   * equivalent to replying to its last post.
   *
   * @param e The event object.
   */
  function onAnnotationReply(e) {
    var $element = $(e.target);
    var $post = $element.parents('.line-annotation:first').find('.discussion_post:last');
    var $form = findOrCreateAnnotationReplyFormForPost($post);

    $element.hide();
    e.preventDefault();
  }

  /**
   * Shows reply buttons for annotations.
   *
   * @param element
   */
  function showReplyButton(element) {
    var $button = $('.reply-annotation', element).filter(DOCUMENT_SELECTOR + '*');
    $button.show();
  }

  /**
   * Handles the annotation bubble click event.
   *
   * @param e The event object.
   */
  function onAnnotationTrigger(e) {
    var $element = $(e.target);
    var $bubble = $element.closest('.line-annotation-trigger');
    var $answer = $element.parents('.answer_programming_file:first');
    var $checkbox = $answer.find('input.annotation-trigger-toggle-all');

    toggleAnnotation($bubble, $bubble.hasClass('collapse-annotation'));
    $checkbox.prop('indeterminate', true);
  }

  /**
   * Expands or collapses the annotation.
   *
   * @param {jQuery} $annotationBubbles The annotation bubbles used to toggle the annotation.
   * @param show The boolean value for whether to display the annotation.
   */
  function toggleAnnotation($annotationBubbles, show) {
    var $annotationRows = $annotationBubbles.parents('tr').next();

    if (show) {
      $annotationBubbles.removeClass('collapse-annotation');
      $annotationRows.show();
    } else {
      $annotationBubbles.addClass('collapse-annotation');
      $annotationRows.hide();
    }
  }

  /**
   * Handles the expand all comments checkbox change event.
   *
   * @param e The event object.
   */
  function onAnnotationExpandAll(e) {
    var expandAll = e.target.checked;
    var $answer = $(e.target).parents('.answer_programming_file:first');

    toggleAnnotation($answer.find('.line-annotation-trigger'), expandAll);
  }

  /**
   * Shows widgets with javascript functionality.
   *
   * @param element
   */
  function showScriptedWidgets(elements) {
    addProgrammingAnnotationLinks(elements);
    showReplyButton(elements);
  }

  $(document).ready(function() {
    showScriptedWidgets(document);
    EVENT_HELPERS.onNodesInserted($(DOCUMENT_SELECTOR), showScriptedWidgets);
    DISCUSSION_POST_HELPERS.initializeToolbar(document, DOCUMENT_SELECTOR + '.line-annotation ');
  });

  $(document).on('click', DOCUMENT_SELECTOR + 'table.codehilite .add-annotation',
    onAddProgrammingAnnotation);
  $(document).on('click', DOCUMENT_SELECTOR + '.annotation-form input[type="reset"]',
    onAnnotationFormResetted);
  $(document).on('click', DOCUMENT_SELECTOR + '.annotation-form input[type="submit"]',
    onAnnotationFormSubmitted);
  $(document).on('click', DOCUMENT_SELECTOR + '.discussion_topic .reply-annotation',
    onAnnotationReply);
  $(document).on('click', DOCUMENT_SELECTOR + '.table.codehilite .line-annotation-trigger',
    onAnnotationTrigger);
  $(document).on('change', DOCUMENT_SELECTOR + '.annotation-trigger-toggle-all',
    onAnnotationExpandAll);
})(jQuery, FORM_HELPERS,
           COURSE_HELPERS,
           ANSWER_HELPERS,
           EVENT_HELPERS,
           DISCUSSION_POST_HELPERS);
