(function($) {
  'use strict';
  var DOCUMENT_SELECTOR = '.course-assessment-submission-submissions.edit ';
  var SUMMARY_GRADE_SELECTOR = '.submission-grades-summary-grade';
  var GRADE_INPUT_SELECTOR = 'input.grade';
  var POINTS_AWARDED_SELECTOR = 'input.submission-points-awarded';
  var MAXIMUM_GRADE_SELECTOR = '#submission-statistics-maximum-grade';
  var TOTAL_GRADE_SELECTOR = '#submission-statistics-total-grade';

  /**
   * Handles the event when a submission answer is graded or when the grade
   * is changed. If the new grade is valid, three items are updated:
   * - The grade for the question in the grades summary
   * - The total grade in the submissions statistics
   * - The experience points awarded
   *
   * @param {Event} event The event object.
   */
  function updateGradesAndPoints(event) {
    var $changedGradeInput = $(event.target);
    var newGrade = $changedGradeInput.val();

    if (!$.isNumeric(newGrade)) { return; }

    var answerId = $changedGradeInput.data('answer-id');
    updateGradesSummary(answerId, newGrade);

    var newTotalGrade = computeNewTotalGrade();
    updateTotalGrade(newTotalGrade);
    updateExperiencePointsAwarded(newTotalGrade);
  }

  /**
   * Updates the grade for a particular answer in the grades summary.
   *
   * @param {Number} answerId The answer's ID
   * @param {Number} newGrade The new grade
   */
  function updateGradesSummary(answerId, newGrade) {
    $('#submission-grades-summary-answer-' + answerId + '-grade').text(newGrade);
  }

  /**
   * Sums the grades of the individual answers based on the updated grades summary.
   *
   * @return {Number} The new total grade for the submission
   */
  function computeNewTotalGrade() {
    return $(SUMMARY_GRADE_SELECTOR).toArray().reduce(function(sum, element) {
      return sum + Number($(element).text());
    }, 0);
  }

  /**
   * Updates the total grade in the submissions statistics
   *
   * @param {Number} newTotalGrade The new total grade
   */
  function updateTotalGrade(newTotalGrade) {
    $(TOTAL_GRADE_SELECTOR).text(newTotalGrade);
  }

  /**
   * Computes and updates the experience points awarded for the submission based on
   * the fraction of the maximum grade attained.
   *
   * @param {Number} newTotalGrade The new total grade
   */
  function updateExperiencePointsAwarded(newTotalGrade) {
    var $pointsAwardedInput = $(POINTS_AWARDED_SELECTOR);
    var basePoints = $pointsAwardedInput.data('base-points');
    var maximumGrade = $(MAXIMUM_GRADE_SELECTOR).text();
    var newPointsAwarded =
      maximumGrade === 0 ? 0 : Math.floor(basePoints * newTotalGrade / maximumGrade);
    $pointsAwardedInput.val(newPointsAwarded);
  }

  $(document).on('change', DOCUMENT_SELECTOR + GRADE_INPUT_SELECTOR, updateGradesAndPoints);
})(jQuery);
