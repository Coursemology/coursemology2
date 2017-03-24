const DELAY = 2000; // Interval to check for job completion in ms.

function showSpinner($link) {
  $link.addClass('disabled btn-primary');
  $link.removeClass('btn-danger');
  $link.children('.fa').hide();
  const $spinner = $('<i class="fa fa-spinner fa-spin"></i>');
  if ($link.children('.fa:not(.fa-lg)').length === 0) {
    $spinner.addClass('fa-lg');
  }
  $link.append($spinner);
}

function hideSpinner($link) {
  $link.removeClass('disabled');
  $link.children('.fa').show();
  $link.children('i.fa-spinner').remove();
}

function showError($link) {
  $link.addClass('btn-danger');
  $link.removeClass('btn-primary');
}

function waitForJob(url, $link) {
  setTimeout(() => {
    $.ajax({
      url,
      method: 'GET',
      dataType: 'json',
      global: false,
    }).done((response) => {
      if (response.status === 'completed') {
        if (response.redirect_url) {
          window.location.href = response.redirect_url;
        }
        hideSpinner($link);
      } else if (response.status === 'submitted') {
        waitForJob(url, $link);
      } else if (response.status === 'errored') {
        hideSpinner($link);
        showError($link);
      }
    }).fail(() => {
      hideSpinner($link);
      showError($link);
    });
  }, DELAY);
}

function onDownload(e) {
  e.preventDefault();
  const $link = $(this);

  showSpinner($link);
  $.ajax({
    url: this.href,
    method: 'GET',
    dataType: 'json',
    global: false,
  }).done((response) => {
    if (response.redirect_url) {
      waitForJob(response.redirect_url, $link);
    }
  }).fail(() => {
    hideSpinner($link);
    showError($link);
  });
}

/**
 * Initializes download job links.
 *
 * @param {String} selector Selector for the download link.
 */
export default function initializeDownloadLink(selector) {
  $(document).on('click', selector, onDownload);
}
