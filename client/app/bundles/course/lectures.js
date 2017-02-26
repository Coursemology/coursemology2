import CourseAPI from 'api/course';

$(document).ready(() => {
  $(document).on('click', '.gen-access-link', function() {
    const $this = $(this);
    const splits = $this.attr('id').split('-');
    const lectureId = splits[2];
    $this.addClass('disabled');
    CourseAPI.lectures.accessLink(lectureId)
      .then((res) => {
        $this.removeClass('disabled');
        const { data: { link } } = res;
        let $link = $('#lec-link-' + lectureId);
        if ($link.length) {
          $link.attr('href', link);
        } else {
          $this.closest('.access-link')
            .prepend($('<a></a>')
              .attr({ id: `lec-link-${lectureId}`, target: '_blank', href: link })
              .text('Go to virtual lecture')
            );
        }
      })
      .catch((error) => {
      $this.removeClass('disabled');
      const { response: { data: { errors } } } = error;
      if (errors) {
        $this.closest('.access-link')
          .append('<br/>')
          .append($('<i></i>')
            .addClass('error')
            .text(errors)
          );
      }
    })
  });
});