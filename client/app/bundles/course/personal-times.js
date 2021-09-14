$(document).ready(() => {
  $('.toggle-personal-time-btn').on('click', function() {
    $(`.toggle-personal-time-${$(this).data('id')}`).hide();
    $(`.personal-time-${$(this).data('id')}`).removeClass('hidden');
  });
});
