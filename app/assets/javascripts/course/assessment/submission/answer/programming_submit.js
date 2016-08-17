(function($) {
  'use strict';
  var DOCUMENT_SELECTOR = '.course-assessment-submission-submissions.edit ';
  var DELAY = 500; // Delay between each job request in ms.

  function onAnswerSubmit(e) {
    e.preventDefault();

    showSpinner($(this));
    submitFormAndWaitForJob($('.edit_submission'), e.target.value);
  }

  function submitFormAndWaitForJob($form, answer_id) {
    var action = $form.attr('action');
    var method = $form.attr('method');

    var data = $form.serializeArray();
    data.push({name: "attempting_answer_id", value: answer_id});
    $.ajax({
      url: action,
      method: method,
      data: $.param(data),
      dataType: 'json',
      global: false
    }).done(function(data) {
      waitForJob(data.redirect_url, answer_id);
    });
  }

  function waitForJob(url, answer_id) {
    setTimeout(function() {
      $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json',
        global: false
      }).done(function(data) {
        onGetJobSuccess(data, url, answer_id);
      })
    }, DELAY);
  }

  function onGetJobSuccess(data, url, answer_id) {
    if (data.status == 'completed') {
      reattemptQuestion(answer_id);
    } else if (data.status == 'submitted') {
      waitForJob(url, answer_id);
    } else {
      // Show errors.
    }
  }

  function reattemptQuestion(answer_id) {
    $.ajax({
      url: 'reattempt_question',
      method: 'POST',
      data: { answer_id: answer_id },
      global: false
    });
  }

  function showSpinner($button) {
    $button.prop('disabled', true);
    $button.append('<i class="fa fa-spinner fa-lg fa-spin"></i>');
  }

  $(document).on('click', DOCUMENT_SELECTOR + '.btn.submit-answer', onAnswerSubmit);
})(jQuery);
