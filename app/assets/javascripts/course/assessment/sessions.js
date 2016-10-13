//= require helpers/form_helpers

(function($, FORM_HELPERS) {
  'use strict';
  var DOCUMENT_SELECTOR = '.course-assessment-sessions ';

  function onPasswordFormSubmit(e) {
    e.preventDefault();

    FORM_HELPERS.submitAndDisableForm($(e.target), onFormSubmitSuccess);
  }

  function onFormSubmitSuccess(data, form) {
    if (data['success'] === true) {
      if (data['submission_url'] !== undefined) {
        window.location.href = data['submission_url'];
      } else {
        createSubmission(data['create_submission_url']);
      }
    } else {
      FORM_HELPERS.enableForm($(form));

      $('input#session_password').effect('shake');
    }
  }

  function createSubmission(url) {
    $.ajax({
      url: url,
      method: 'POST',
      data: {}
    }).done(function(data) {
      if (data.redirect !== undefined && data.redirect) {
        window.location.href = data.redirect;
      }
    });
  }

  $(document).on('submit', DOCUMENT_SELECTOR + '.session', onPasswordFormSubmit);
})(jQuery, FORM_HELPERS);
