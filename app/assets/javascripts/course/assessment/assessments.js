(function($) {
  'use strict';

  var DOCUMENT_SELECTOR = '.course-assessment-assessments.show ';
  var QUESTIONS_SELECTOR = '#sortable-questions ';

  function submitReordering(assessmentId, serializedOrdering) {
    var action = assessmentId + '/reorder';
    var method = 'post';
    $.ajax({ url: action, method: method, data: serializedOrdering });
  }

  function serializedOrdering() {
    var options = { attribute: 'data-question-dom-id', key: 'question_order[]' };
    var ordering = $(DOCUMENT_SELECTOR + QUESTIONS_SELECTOR).sortable('serialize', options);

    return ordering;
  }

  function getAssessmentId(target) {
    return $(target).parents('.assessment:first').data('assessment-id');
  }

  function initializeQuestionSorting() {
    $(DOCUMENT_SELECTOR + QUESTIONS_SELECTOR).sortable({
      update: function(e){
        var assessmentId = getAssessmentId(e.target);
        var ordering = serializedOrdering();

        submitReordering(assessmentId, ordering);
      }
    });
  }

  $(document).on('turbolinks:load', function() {
    initializeQuestionSorting();
  });
})(jQuery);
