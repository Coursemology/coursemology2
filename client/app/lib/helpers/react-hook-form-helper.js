const toCamel = (str) =>
  str.replace(/([-_][a-z])/gi, ($1) =>
    $1.toUpperCase().replace('-', '').replace('_', ''),
  );

const isObject = (obj) =>
  obj === Object(obj) && !Array.isArray(obj) && typeof obj !== 'function';

const keysToCamel = (obj) => {
  if (isObject(obj)) {
    const n = {};

    Object.keys(obj).forEach((k) => {
      n[toCamel(k)] = keysToCamel(obj[k]);
    });

    return n;
  }
  if (Array.isArray(obj)) {
    return obj.map((i) => keysToCamel(i));
  }

  return obj;
};

/**
 * Converts RoR errors into field error for react-hook-form
 *
 * @param {function=} setError a function from react-hook-form that sets field error
 * @param {Object=} errors errors returned from RoR in the form of { name<string>: error<string[]>,  }
 */
export function setReactHookFormError(setError, errors) {
  if (setError && errors) {
    Object.entries(keysToCamel(errors)).forEach(([name, error]) =>
      setError(name, { message: error.toString() }),
    );
  }
}
