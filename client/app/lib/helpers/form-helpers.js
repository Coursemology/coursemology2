/**
 * Finds the form fields in the given form.
 *
 * @param {jQuery} $form The form to search.
 * @param {String|undefined} selector The filter to apply on the returned fields.
 *
 * @returns {jQuery} The set of fields matching the filter.
 */
function findFormFields($form, selector) {
  let $result = $form.find('textarea, input');
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
  const data = $form.find(':input').serializeArray();
  const token = {
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
  let action;
  let method;
  let formData;
  if ($form.is('form')) {
    action = $form.attr('action');
    method = $form.attr('method');
    formData = $form.serialize();
  } else {
    action = $form.data('action');
    method = $form.data('method');
    formData = buildFormData($form);
  }

  $.ajax({ url: action, method, data: formData })
    .done((data) => {
      successHandler(data, $form[0]);
    })
    .fail((data) => {
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

/**
 * Adjust another date field based on a date field
 *
 * @param {Date} newStartAt new start_at date value
 * @param {function} watch watch function from react hook form to get previous field values
 * @param {function} setValue setValue function from react hook form to set a field value
 * @param {string} startAtField field name of watched field
 * @param {string} endAtField field name of target field
 */
function shiftDateField(
  newStartAt,
  watch,
  setValue,
  startAtField = 'start_at',
  endAtField = 'end_at',
) {
  const oldStartAt = watch(startAtField);
  const oldEndAt = watch(endAtField);
  if (!oldStartAt || !oldEndAt || !newStartAt) {
    return;
  }
  const oldStartTime = new Date(oldStartAt).getTime();
  const oldEndTime = new Date(oldEndAt).getTime();

  // if start time is before end time, allow user to clear the error
  if (oldStartTime <= oldEndTime) {
    const newStartTime = new Date(newStartAt).getTime();
    const newEndAt = new Date(oldEndTime + (newStartTime - oldStartTime));
    setValue(endAtField, newEndAt);
  }
}

export {
  enableForm,
  parentFormForElement,
  removeParentForm,
  shiftDateField,
  submitAndDisableForm,
};
