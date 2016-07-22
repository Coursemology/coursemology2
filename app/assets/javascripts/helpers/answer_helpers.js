var ANSWER_HELPERS = (function (){
  'use strict';

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
   * Gets the answer ID for the given element.
   *
   * @param {jQuery} $element The element to find the associated answer for.
   * @return {Number} The ID for the answer the element is associated with.
   */
  function answerIdForElement($element) {
    var $answer = $element.parents('.answer:first');
    return $answer.data('answerId');
  }

  return {
    courseIdForElement: courseIdForElement,
    assessmentIdForElement: assessmentIdForElement,
    submissionIdForElement: submissionIdForElement,
    answerIdForElement: answerIdForElement,
  };
}());
