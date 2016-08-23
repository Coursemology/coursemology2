(function($) {
  'use strict';
  $(document).on('turbolinks:load', function() {
    var $index = $('.course-lesson-plan-items.index');
    var $pastMilestones = $('.milestone-body.past:not(:last)', $index);
    if ($pastMilestones.length === 0) {
      $pastMilestones.add('#milestone-ungrouped', $index);
    }

    $pastMilestones.collapse('hide');
    $('.lesson-plan-item-body', $index).collapse('hide');
  });
})(jQuery);
