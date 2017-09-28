require('jquery-ui/ui/widgets/sortable');

$(document).ready(() => {
  $('.weight').hide();
  $('.reorder').show();

  $('.sidebar-items tbody').sortable({
    axis: 'y',
    helper(e, ui) {
      ui.children().each(() => {
        $(this).width($(this).width());
      });
      return ui;
    },
    stop() {
      $('.weight input').val(index => index + 1);
    },
  });
});
