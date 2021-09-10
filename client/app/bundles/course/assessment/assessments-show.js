require('jquery-ui/ui/widgets/sortable');

const QUESTIONS_SELECTOR = '#sortable-questions ';

function submitReordering(assessmentId, ordering) {
  const action = `${assessmentId}/reorder`;
  const method = 'post';
  $.ajax({ url: action, method, data: ordering });
}

function serializedOrdering() {
  const options = {
    attribute: 'data-question-dom-id',
    key: 'question_order[]',
  };
  const ordering = $(QUESTIONS_SELECTOR).sortable('serialize', options);

  return ordering;
}

function getAssessmentId(target) {
  return $(target).parents('.assessment:first').data('assessment-id');
}

function initializeQuestionSorting() {
  $(QUESTIONS_SELECTOR).sortable({
    update(e) {
      const assessmentId = getAssessmentId(e.target);
      const ordering = serializedOrdering();

      submitReordering(assessmentId, ordering);
    },
  });
}

$(document).ready(() => {
  initializeQuestionSorting();
  $('[data-toggle="tooltip"]').tooltip();
});
