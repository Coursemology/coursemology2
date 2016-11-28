require('jquery-ui/ui/widgets/sortable');

$(document).ready(() => {
  $('.weight').hide();
  $('.reorder').show();

  $('.sidebar-items tbody').sortable({
    axis: 'y',
    stop() {
      $('.weight input').val(index => index + 1);
    },
  }).disableSelection();
});
