var COURSE_HELPERS = (function ($) {
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

  return {
    courseIdForElement: courseIdForElement,
  };
})(jQuery);
