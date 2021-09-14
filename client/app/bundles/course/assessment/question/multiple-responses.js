require('jquery-ui/ui/widgets/sortable');

$(document).ready(() => {
  // When items are removed, there might be gaps in the weights.
  function updateWeights() {
    $('.weight input').val((index) => index + 1);
  }

  $('.multiple-response-options tbody').on(
    'cocoon:after-insert cocoon:after-remove',
    () => {
      updateWeights();
    }
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
});
