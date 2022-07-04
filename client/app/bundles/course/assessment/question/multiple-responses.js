require('jquery-ui/ui/widgets/sortable');

$(() => {
  // When items are removed, there might be gaps in the weights.
  function updateWeights() {
    $('.weight input').val((index) => index + 1);
  }

  $('.multiple-response-options tbody').on(
    'cocoon:after-insert cocoon:after-remove',
    () => {
      updateWeights();
    },
  );

  $('.multiple-response-options tbody').sortable({
    axis: 'y',
    handle: '.handle',
    helper(e, ui) {
      ui.children().each(() => {
        $(this).width($(this).width());
      });
      return ui;
    },
    stop() {
      updateWeights();
    },
  });

  function rendeTableOptionColumn() {
    const element = $('#question_multiple_response_skip_grading');
    if (element && element[0].checked) {
      $('.table-option').hide();
    } else {
      $('.table-option').show();
    }
  }

  $(rendeTableOptionColumn);

  $('.question_multiple_response_skip_grading').on('click', () => {
    rendeTableOptionColumn();
  });

  // When add_option button is clicked, hide the correct option after it's rendered
  $('.add_fields').on('click', () => {
    setTimeout(() => {
      rendeTableOptionColumn();
    }, 10);
  });
});
