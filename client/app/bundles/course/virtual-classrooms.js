import CourseAPI from 'api/course';

function appendError($node, selector, text) {
  (selector ? $node.closest(selector) : $node).append(
    $('<i></i>').addClass('error').text(text),
  );
}

function appendInfo($node, selector, text) {
  (selector ? $node.closest(selector) : $node).append(
    $('<i></i>').addClass('info').text(text),
  );
}

$(() => {
  $(document).on('click', '.gen-access-link', function () {
    const $this = $(this);
    const splits = $this.attr('id').split('-');
    const virtualClassroomId = splits[2];
    $this.addClass('disabled');
    CourseAPI.virtualClassrooms
      .accessLink(virtualClassroomId)
      .then((response) => {
        const {
          data: { link },
        } = response;
        const $link = $(`#lec-link-${virtualClassroomId}`);
        if ($link.length) {
          $link.attr('href', link);
        } else {
          $this.closest('.access-link').prepend(
            $('<a></a>')
              .attr({
                id: `lec-link-${virtualClassroomId}`,
                target: '_blank',
                href: link,
              })
              .text('Go to virtual classroom'),
          );
        }
        $this.remove();
      })
      .catch((error) => {
        $this.removeClass('disabled');
        const {
          response: {
            data: { errors },
          },
        } = error;
        if (errors) {
          $this.closest('.access-link').append($('<br/>'));
          appendError($this, '.access-link', errors);
        }
      });
  });

  $(document).on('click', '.fetch-recorded-videos', function () {
    const $this = $(this);
    const $div = $this.closest('.recorded-videos');
    const splits = $this.attr('id').split('-');
    const virtualClassroomId = splits[2];
    $this.addClass('disabled');

    CourseAPI.virtualClassrooms
      .recordedVideos(virtualClassroomId)
      .then((response) => {
        const { data: recordings } = response;
        $this.closest('.recorded-videos').html('');
        if (recordings.length === 0) {
          appendInfo($div, null, 'No recorded videos found');
        } else if (recordings[0].status === 'error') {
          appendError($div, null, recordings[0].error);
        } else {
          let i;
          for (i = 0; i < recordings.length; i += 1) {
            const recording = recordings[i];
            $div.append(
              $('<a></a>')
                .attr({
                  class: 'recorded-video-link',
                  'data-record-id': recording.id,
                  href: '#',
                })
                .text(recording.name),
            );
          }
        }
        $this.remove();
      })
      .catch((error) => {
        $div.closest('.recorded-videos').html('');
        const {
          response: {
            data: { errors },
          },
        } = error;
        if (errors) {
          appendError($div, null, 'A network error has occurred');
        }
      });
  });

  $(document).on('click', '.recorded-video-link', function (event) {
    event.preventDefault();
    const $this = $(this);
    const recordId = $this.attr('data-record-id');
    const text = $this.text();
    $this.text('Please Wait...');

    CourseAPI.virtualClassrooms
      .recordedVideoLink(recordId)
      .then((response) => {
        const {
          data: { link },
        } = response;
        window.open(link, '_blank');
        $this.text(text);
      })
      .catch((error) => {
        $this.removeClass('disabled');
        const {
          response: {
            data: { errors },
          },
        } = error;
        if (errors) {
          appendError($this, 'A network error has occurred');
        }
        $this.text(text);
      });
  });
});
