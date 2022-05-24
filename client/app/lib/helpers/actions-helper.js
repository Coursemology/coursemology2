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
