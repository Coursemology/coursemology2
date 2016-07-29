(function($) {
  'use strict';
  var DOCUMENT_SELECTOR = '.course-assessment-submission-submissions.edit ';

  function onAnswerSubmit(e) {
    e.preventDefault();

    showSpinner($(this));
    submitFormAndWaitForJob($('.edit_submission'), e.target.value);
  }

  function submitFormAndWaitForJob($form, answer_id) {
    var action = $form.attr('action');
    var method = $form.attr('method');

    var $input = $('<input>').attr('type', 'hidden').
    attr('name', 'attempting_answer_id').val(answer_id);
    $form = $form.clone().append($input);

    var data = $form.serialize();
    $.ajax({
      url: action,
      method: method,
      data: data,
      dataType: 'json',
      global: false
    }).done(function(data) {
      waitForJob(data.redirect_url, answer_id);
    });
  }

  function waitForJob(url, answer_id) {
  }

  function showSpinner($button) {
    $button.prop('disabled', true);
    $button.append('<i class="fa fa-spinner fa-lg fa-spin"></i>');
  }

  $(document).on('click', DOCUMENT_SELECTOR + '.btn.submit-answer', onAnswerSubmit);
})(jQuery);
