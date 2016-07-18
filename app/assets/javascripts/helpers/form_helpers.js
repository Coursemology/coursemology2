var FORM_HELPERS = (function (){
  'use strict';

  /**
   * Finds the form fields in the given form.
   *
   * @param {jQuery} $form The form to search.
   * @param {String|undefined} selector The filter to apply on the returned fields.
   *
   * @returns {jQuery} The set of fields matching the filter.
   */
  function findFormFields($form, selector) {
    var $result = $form.find('textarea, input');
    if (selector) {
      $result = $result.filter(selector);
    }

    return $result;
  };

  /**
   * Builds the form data from the given form.
   *
   * This is a less sophisticated version of $.serialize() in that it only supports inputs and
   * textareas.
   *
   * @param {jQuery} $form The form being submitted.
   * @returns {Object} The form data to be submitted.
   */
  function buildFormData ($form) {
    var $fields = findFormFields($form, ':not(:disabled)');
    var data = {
      authenticity_token: $(document).find('meta[name="csrf-token"]').attr('content')
    };
    $fields.each(function() {
      if (this.name === '') {
        return;
      }

      data[this.name] = $(this).val();
    });

    return data;
  };


  /**
   * @callback formSubmitSuccessCallback
   * @param {data} data The server response
   * @param {HTMLElement} form The submitted form
   */

   /**
    * @callback formSubmitFailureCallback
    * @param {data} data The server response
    * @param {HTMLElement} form The submitted form
    */

  /**
   * Submits a form and disable form input.
   *
   * @param {jQuery} $form The form being submitted
   * @param {formSubmitSuccessCallback} successHandler
   * @param {formSubmitFailureCallback} failureHandler
   */
  function submitAndDisableForm ($form, successHandler, failureHandler) {
    if ($form.is('form')) {
      var action = $form.attr('action');
      var method = $form.attr('method');
      var data = $form.serialize();
    } else {
      var action = $form.data('action');
      var method = $form.data('method');
      var data = buildFormData($form);
    }

    $.ajax({ url: action, method: method, data: data }).
      done(function(data) { successHandler(data, $form[0]); }).
      fail(function(data) { failureHandler(data, $form[0]); });

    findFormFields($form).prop('disabled', true);
  }

  return {
    findFormFields: findFormFields,
    submitAndDisableForm: submitAndDisableForm
  };
}());
