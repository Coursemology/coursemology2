//= require jquery-shorten/src/jquery.shorten

(function($) {
  'use strict';
  var QUESTION_SELECTOR = '.course-assessment-question-programming.edit';
  var SUBMISSION_SELECTOR = '.course-assessment-submission-submissions.edit';
  var EXPECTED_VALUE_SELECTOR = QUESTION_SELECTOR + ' .expected' +
                                ', ' +
                                SUBMISSION_SELECTOR + ' .expected';

  function shortenExpectedText() {
    $(EXPECTED_VALUE_SELECTOR).shorten({
      'showChars': 140,
      'moreText': I18n.t('common.show_more'),
      'lessText': I18n.t('common.show_less')
    });
  }

  $(document).on('turbolinks:load', function() {
    shortenExpectedText();
  });
})(jQuery);
