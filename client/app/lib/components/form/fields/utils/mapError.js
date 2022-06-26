/**
 * Formats the first error or warning message for display.
 *
 * @param errorOrWarning The message could look like any one of the following:
 *   1) A string - 'cannot be blank'
 *   2) An array - ['must contain a digit', 'too long']
 *   3) An object - { id: 'translations.module.id', defaultMessage: [{ id: 0, value: 'Translated Error'}] }
 * @param intl
 */
export const formatErrorMessage = (errorOrWarning, intl) => {
  if (!errorOrWarning || typeof errorOrWarning === 'string') {
    return errorOrWarning;
  }
  if (Array.isArray(errorOrWarning)) {
    return errorOrWarning.length > 0 && errorOrWarning[0];
  }
  if (intl && typeof errorOrWarning === 'object') {
    return intl.formatMessage(errorOrWarning);
  }
  if (typeof errorOrWarning === 'object') {
    return errorOrWarning.defaultMessage[0].value;
  }
  return errorOrWarning;
};

const mapError = (
  {
    meta: { touched, error, warning } = {},
    input: { ...inputProps },
    intl,
    ...props
  },
  errorProp = 'errorText',
) => {
  const errorOrWarning = error || warning;
  return touched && errorOrWarning
    ? {
        ...inputProps,
        ...props,
        [errorProp]: formatErrorMessage(errorOrWarning, intl),
      }
    : { ...inputProps, ...props };
};

export default mapError;
