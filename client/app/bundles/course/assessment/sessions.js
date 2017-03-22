import { enableForm, submitAndDisableForm } from 'lib/helpers/form-helpers';

require('jquery-ui/ui/effects/effect-shake');

function createSubmission(url) {
  $.ajax({
    url,
    method: 'POST',
    data: {},
  }).done((data) => {
    if (data.redirect !== undefined && data.redirect) {
      window.location.href = data.redirect;
    }
  });
}

function onFormSubmitSuccess(data, form) {
  if (data.success === true) {
    if (data.submission_url !== undefined) {
      window.location.href = data.submission_url;
    } else {
      createSubmission(data.create_submission_url);
    }
  } else {
    enableForm($(form));

    $('input#session_password').effect('shake');
  }
}

function onPasswordFormSubmit(e) {
  e.preventDefault();

  submitAndDisableForm($(e.target), onFormSubmitSuccess);
}

$(document).on('submit', '.session', onPasswordFormSubmit);
