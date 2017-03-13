const DELAY = 500; // Delay between each job request in ms.

function reloadAnswer(answerId) {
  $.ajax({
    url: 'reload_answer',
    method: 'POST',
    data: { answer_id: answerId },
    global: false,
  });
}

function waitForJob(url, answerId, delay) {
  setTimeout(() => {
    $.ajax({
      url,
      method: 'GET',
      dataType: 'json',
      global: false,
    }).done((response) => {
      if (response.status === 'completed') {
        reloadAnswer(answerId);
      } else if (response.status === 'submitted') {
        waitForJob(url, answerId);
      }
    }).fail(() => {
      // Error message is rendered by the answer.
      reloadAnswer(answerId);
    });
  }, delay || DELAY);
}

function submitFormAndWaitForJob($form, answerId) {
  const action = $form.attr('action');
  const method = $form.attr('method');
  let data;

  const containsFile = $form.find(':file').filter(function () {
    return $(this).val() !== '';
  }).length > 0;

  const ajaxOptions = {
    url: action,
    method,
    global: false,
  };

  if (containsFile) {
    data = new FormData($form[0]);
    data.append('answer_id', answerId);
    ajaxOptions.data = data;
    ajaxOptions.enctype = 'multipart/form-data';
    ajaxOptions.processData = false;
    ajaxOptions.contentType = false;
  } else {
    data = $form.serializeArray();
    data.push({ name: 'answer_id', value: answerId });
    ajaxOptions.data = $.param(data);
    ajaxOptions.dataType = 'json';
  }

  $.ajax(ajaxOptions).done((response) => {
    if (response.redirect_url) {
      waitForJob(response.redirect_url, answerId);
    } else {
      reloadAnswer(answerId);
    }
  });
}

function showSpinner($button) {
  $button.prop('disabled', true);
  $button.append('<i class="fa fa-spinner fa-lg fa-spin"></i>');
}

function hideErrorMessage(answerId) {
  $(`div#answer_${answerId}`).find('p.bg-danger').hide();
}

function onAnswerSubmit(e) {
  e.preventDefault();

  const answerId = e.target.value;
  showSpinner($(this));
  hideErrorMessage(answerId);
  submitFormAndWaitForJob($('.edit_submission'), answerId);
}

// Find all the spinning jobs in the page and check their statuses.
function checkSubmittedJobs() {
  $('a.btn.submitted').each(function (index) {
    const answer = $(this).closest('.answer');
    const jobUrl = $(this).data('job-path');
    const answerId = answer.data('answer-id');
    // Use different delays, so that all the requests won't send at once.
    waitForJob(jobUrl, answerId, (index + 1) * DELAY);
  });
}

$(document).on('click', '.btn.submit-answer', onAnswerSubmit);
$(document).ready(checkSubmittedJobs);
