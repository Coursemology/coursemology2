var FORM_HELPERS = (function ($) {
  'use strict';

  /**
   * Returns a method that renders templates from a given default path.
   *
   * @param {String} defaultPath The absolute path to where the templates reside.
   * @return {renderFromPath~inner} The renderer.
   */
  function renderFromPath(defaultPath) {
    /**
     * Renders a specified template.
     *
     * @param {String} template The relative path to the template. Absolute paths or paths
     *   beginning with a period are not expanded.
     * @param {Object} locals The local variables to be given to the template.
     * @return {String} The rendered template.
     */
    function render(template, locals) {
      if (template[0] !== '/' && template[0] !== '.') {
        template = defaultPath + template;
      }

      return JST[template](locals);
    }

    return render;
  }

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
  }

  /**
   * Builds the form data from the given form.
   *
   * @param {jQuery} $form The form being submitted.
   * @returns {Array} The form data to be submitted.
   */
  function buildFormData($form) {
    var data = $form.find(':input').serializeArray();
    var token = {
      authenticity_token: $(document)
        .find('meta[name="csrf-token"]')
        .attr('content'),
    };
    data.push(token);
    return data;
  }

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
  function submitAndDisableForm($form, successHandler, failureHandler) {
    if ($form.is('form')) {
      var action = $form.attr('action');
      var method = $form.attr('method');
      var data = $form.serialize();
    } else {
      var action = $form.data('action');
      var method = $form.data('method');
      var data = buildFormData($form);
    }

    $.ajax({ url: action, method: method, data: data })
      .done(function (data) {
        successHandler(data, $form[0]);
      })
      .fail(function (data) {
        failureHandler(data, $form[0]);
      });

    findFormFields($form).prop('disabled', true);
  }

  /**
   * Enables the input fields of a form.
   *
   * @param {jQuery} $form The form being enabled
   */
  function enableForm($form) {
    findFormFields($form).prop('disabled', false);
  }

  /**
   * Finds the form which $element is a child of.
   *
   * @param {jQuery} $element The form's child element
   */
  function parentFormForElement($element) {
    return $element.parents('[data-action]:first');
  }

  /**
   * Removes the form which $element is a part of.
   *
   * @param {jQuery} $element The form's child element
   */
  function removeParentForm($element) {
    parentFormForElement($element).remove();
  }

  return {
    renderFromPath: renderFromPath,
    submitAndDisableForm: submitAndDisableForm,
    enableForm: enableForm,
    parentFormForElement: parentFormForElement,
    removeParentForm: removeParentForm,
  };
})(jQuery);
