
(function($) {
  /* global JST, Routes */
  'use strict';
  $(document).on('click', '.gen-access-link', function() {
    var $this = $(this);
    var splits = $this.attr('id').split('-');
    var courseId = splits[1];
    var lectureId = splits[2];
    $this.addClass('disabled');
    $.get(Routes.access_link_course_lecture_path(courseId, lectureId, { format: 'json' }),
      function(response){
        $this.removeClass('disabled');
        var link = response.link;
        if (link) {
          var $link = $('#lec-link-' + lectureId);
          if ($link.length) {
            $link.attr('href', link)
          } else {
            $this.closest('.access-link').prepend(
              "<a id='lec-link-" + lectureId + "' target='_blank' href='" + link + "'>Go to" +
              " virtual lecture</a>"
            );
          }
        } else {
          // TODO: Add error message
        }
    });
  });
})(jQuery);
