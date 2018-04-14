import { enableForm, submitAndDisableForm } from 'lib/helpers/form-helpers';

require('jquery-ui/ui/effects/effect-shake');

function onFormSubmitSuccess(data, form) {
  if (data.success === true) {
    window.location.reload();
  } else {
    enableForm($(form));

    $('input#assessment_password').effect('shake');
  }
}

function onPasswordFormSubmit(e) {
  e.preventDefault();

  submitAndDisableForm($(e.target), onFormSubmitSuccess);
}

$(document).on('submit', '.assessment', onPasswordFormSubmit);
