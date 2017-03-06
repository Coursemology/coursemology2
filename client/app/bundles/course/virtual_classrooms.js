import CourseAPI from 'api/course';

$(document).ready(() => {
  $(document).on('click', '.gen-access-link', function () {
    const $this = $(this);
    const splits = $this.attr('id').split('-');
    const virtualClassroomId = splits[2];
    $this.addClass('disabled');
    CourseAPI.virtualClassrooms.accessLink(virtualClassroomId)
      .then((res) => {
        $this.removeClass('disabled');
        const { data: { link } } = res;
        const $link = $(`#lec-link-${virtualClassroomId}`);
        if ($link.length) {
          $link.attr('href', link);
        } else {
          $this.closest('.access-link')
            .prepend($('<a></a>')
              .attr({ id: `lec-link-${virtualClassroomId}`, target: '_blank', href: link })
              .text('Go to virtual classroom')
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
      });
  });
});
