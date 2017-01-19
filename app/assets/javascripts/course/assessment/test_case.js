//= require jquery-shorten/src/jquery.shorten

(function($) {
  'use strict';
  var QUESTION_SELECTOR = '.course-assessment-question-programming.edit';
  var SUBMISSION_SELECTOR = '.course-assessment-submission-submissions.edit';
  var TEST_CASE_SELECTOR = QUESTION_SELECTOR + ' .expected' + ', ' +
                           SUBMISSION_SELECTOR + ' .expected' + ', ' +
                           QUESTION_SELECTOR + ' .output' + ', ' +
                           SUBMISSION_SELECTOR + ' .output';

  function shortenTestCaseText() {
    $(TEST_CASE_SELECTOR).shorten({
      'showChars': 140,
      'moreText': I18n.t('common.show_more'),
      'lessText': I18n.t('common.show_less')
    });
  }

  $(document).ready(function() {
    shortenTestCaseText();
  });
})(jQuery);
