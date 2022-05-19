$(() => {
  $('input.self-directed-learning-checkbox:checkbox').change(function () {
    if ($(this).is(':checked')) {
      $('div.advance-start-at-time').show();
      $('.advance-start-at-time input').prop('required', true);
    } else {
      $('.advance-start-at-time input').prop('required', false);
      $('.advance-start-at-time input').val('');
      $('div.advance-start-at-time').hide();
    }
  });

  $('#course_show_personalized_timeline_features').change(function () {
    if ($(this).is(':checked')) {
      $('div.personalized-timeline-feature').show();
    } else {
      $('div.personalized-timeline-feature').hide();
    }
  });
});
