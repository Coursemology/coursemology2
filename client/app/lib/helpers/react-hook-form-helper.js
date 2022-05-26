/* eslint-disable import/prefer-default-export */
/**
 * Converts RoR errors into field error for react-hook-form
 *
 * @param {function} setError a function from react-hook-form that sets field error
 * @param {Object} errors errors returned from RoR in the form of { name<string>: error<string[]>,  }
 */
export function setReactHookFormError(setError, errors) {
  if (setError) {
    Object.entries(errors).forEach(([name, error]) =>
      setError(name, { message: error.toString() }),
    );
  }
}

/**
 * Resets nested arrays in fields in react-hook-form
 * Sets their initialValue to the value in `array`.
 * This is a workaround solution until the library supports resetting nested arrays
 *
 * @param {resetField} resetField a function from react-hook-form that resets field
 * @param {array} array new value to be reset to
 * @param {path} path the field name to reset
 */
export function resetArrayFields(resetField, array, path = '') {
  const fieldPath = path === '' ? '' : `${path}.`;
  array.forEach((obj, index) => {
    Object.keys(obj).forEach((fieldName) => {
      resetField(`${fieldPath}${index}.${fieldName}`, {
        defaultValue: obj[fieldName],
      });
    });
  });
}

/**
 * Workaround to reset objects in fields in react-hook-form
 * Sets their initialValue to the value in `fields`
 * This is a workaround solution by individually resetting fields of objects,
 * until the library supports it.
 * https://github.com/react-hook-form/react-hook-form/issues/7841
 *
 * @param {resetField} resetField a function from react-hook-form that resets field
 * @param {fields} fields new object to be reset to
 * @param {path} path the field name to reset
 */
export function resetObjectFields(resetField, fields, path = '') {
  const fieldPath = path === '' ? '' : `${path}`;
  Object.keys(fields).forEach((fieldName) => {
    if (fieldName === 'files_attributes') {
      // we specifically target 'files_attributes' since it is a nested array,
      // and we need to reset this attribute for assessment submissions.
      // react-hook-form's resetField needs to reset each arrayField individually
      resetArrayFields(
        resetField,
        fields[fieldName],
        `${fieldPath}.${fieldName}`,
      );
    } else {
      resetField(`${fieldPath}.${fieldName}`, {
        defaultValue: fields[fieldName],
      });
    }
  });
}
