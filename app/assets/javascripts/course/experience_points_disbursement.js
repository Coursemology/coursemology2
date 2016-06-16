(function($) {
  'use strict';
  var COPY_BUTTON_SELECTOR = '#experience-points-disbursement-copy-button';

  function copyExperiencePoints(event) {
    event.preventDefault();
    var valueToCopy = $('.course_user:first').find('.points_awarded:first').val();
    $('.points_awarded').val(valueToCopy);
  }

  $(document).on('click', COPY_BUTTON_SELECTOR, copyExperiencePoints);
})(jQuery);
