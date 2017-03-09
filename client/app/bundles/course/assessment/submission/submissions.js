import getUrlParameter from 'lib/helpers/url_helpers';

/* eslint wrap-iife: ["error", "inside"] */
/* eslint no-use-before-define: ["error", { "functions": false }] */
/* global $:false, jQuery:false */
(function ($) {
  const DOCUMENT_SELECTOR = '.course-assessment-submission-submissions.edit ';
  const SINGLE_QUESTION_ASSESSMENT_SELECTOR = `${DOCUMENT_SELECTOR}.single-question `;
  const MULTI_QUESTION_ASSESSMENT_SELECTOR = `${DOCUMENT_SELECTOR}.multi-question `;
  const SUMMARY_GRADE_SELECTOR = '.submission-grades-summary-grade';
  const GRADE_INPUT_SELECTOR = 'input.grade';
  const POINTS_AWARDED_SELECTOR = 'input.submission-points-awarded';
  const MAXIMUM_GRADE_SELECTOR = '.submission-statistics-maximum-grade';
  const TOTAL_GRADE_SELECTOR = '.submission-statistics-total-grade';

  /**
   * Update the initial EXP points after page load.
   */
  function updateInitialPoints() {
    if ($(DOCUMENT_SELECTOR).length !== 0) {
      const totalGrade = Number($(TOTAL_GRADE_SELECTOR).text());
      if (isNaN(totalGrade)) { return; }

      const assignedExp = $(POINTS_AWARDED_SELECTOR).val();
      if (!assignedExp) {
        updateExperiencePointsAwarded(totalGrade);
      }
    }
  }
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
    const $changedGradeInput = $(event.target);
    const newGrade = $changedGradeInput.val();

    if (!$.isNumeric(newGrade)) { return; }

    const answerId = $changedGradeInput.data('answer-id');
    updateGradesSummary(answerId, newGrade);

    const newTotalGrade = computeNewTotalGrade();
    updateTotalGrade(newTotalGrade);
    updateExperiencePointsAwarded(newTotalGrade);
  }

  /**
   * Updates the total grade and experience points awarded in the submission statistics
   * when the submission's assessment has only one question. Unlike `updateGradesAndPoints`
   * this method updates the statistics directly instead of via the Grades Summary.
   *
   * @param {Event} event The event object.
   */
  function updateGradesAndPointsSingleQuestion(event) {
    const $changedGradeInput = $(event.target);
    const newGrade = $changedGradeInput.val();

    if (!$.isNumeric(newGrade)) { return; }

    updateTotalGrade(newGrade);
    updateExperiencePointsAwarded(newGrade);
  }

  /**
   * Updates the grade for a particular answer in the grades summary.
   *
   * @param {Number} answerId The answer's ID
   * @param {Number} newGrade The new grade
   */
  function updateGradesSummary(answerId, newGrade) {
    $(`#submission-grades-summary-answer-${answerId}-grade`).text(newGrade);
  }

  /**
   * Sums the grades of the individual answers based on the updated grades summary.
   *
   * @return {Number} The new total grade for the submission
   */
  function computeNewTotalGrade() {
    return $(SUMMARY_GRADE_SELECTOR).toArray().reduce((sum, element) =>
       (sum + Number($(element).text()))
    , 0);
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
    const actualPoints = getActualPoints(newTotalGrade);
    const newPointsAwarded = Math.floor(actualPoints * getMultiplier());
    $(POINTS_AWARDED_SELECTOR).val(newPointsAwarded);
  }

  /**
   * Get the actual points (points before adpot multiplier) that we should award.
   *
   * @param {Number} totalGrade The total grade.
   * @returns {Number}
   */
  function getActualPoints(totalGrade) {
    const $pointsAwardedInput = $(POINTS_AWARDED_SELECTOR);
    const basePoints = $pointsAwardedInput.data('base-points');
    const maximumGrade = $(MAXIMUM_GRADE_SELECTOR).first().text();

    let actualPoints = 0;
    if (maximumGrade !== 0) {
      actualPoints = Math.floor((basePoints * totalGrade) / maximumGrade);
    }

    return actualPoints;
  }

  /**
   * Handles the event when the value of the multiplier changes.
   */
  function onMultiplierChange(e) {
    const $pointsAwardedInput = $(POINTS_AWARDED_SELECTOR);
    const multiplier = Number(e.target.value);
    const totalGrade = Number($(TOTAL_GRADE_SELECTOR).text());
    if (isNaN(multiplier) || isNaN(totalGrade)) { return; }

    const actualPoints = getActualPoints(totalGrade);
    const newPoints = Math.floor(actualPoints * multiplier);
    $pointsAwardedInput.val(newPoints);
  }

  /**
   * Get the value of current multiplier.
   *
   * @returns {Number}
   */
  function getMultiplier() {
    let multiplier = Number($('.exp-multiplier input').val());
    if (isNaN(multiplier)) {
      multiplier = 1;
    }

    return multiplier;
  }

  function initializeAnswerTabs() {
    $(`${MULTI_QUESTION_ASSESSMENT_SELECTOR}.answers-tab a`).click(function (e) {
      e.preventDefault();
      $(this).tab('show');
    });

    // Initialize Ace Editor when tab is shown.
    $(`${MULTI_QUESTION_ASSESSMENT_SELECTOR}.tab-header a`).on('shown.bs.tab', (e) => {
      const identifier = e.target.getAttribute('aria-controls');
      $(`#${identifier}`).find('textarea.code').ace();
    });

    const step = getUrlParameter('step') || 1;
    $(`${MULTI_QUESTION_ASSESSMENT_SELECTOR}.tab-header a[step="${step}"]`).tab('show');
  }

  function initializeAceEditor() {
    $(`${DOCUMENT_SELECTOR}textarea.code`).not('.tab-content textarea.code').ace();
  }

  $(document).on('change', MULTI_QUESTION_ASSESSMENT_SELECTOR + GRADE_INPUT_SELECTOR,
                           updateGradesAndPoints);
  $(document).on('change', SINGLE_QUESTION_ASSESSMENT_SELECTOR + GRADE_INPUT_SELECTOR,
                           updateGradesAndPointsSingleQuestion);
  $(document).on('change', `${DOCUMENT_SELECTOR}.exp-multiplier input`, onMultiplierChange);
  $(document).ready(updateInitialPoints);
  $(document).ready(initializeAnswerTabs);
  $(document).ready(initializeAceEditor);
})(jQuery);
