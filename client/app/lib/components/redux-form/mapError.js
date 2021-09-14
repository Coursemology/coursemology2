/**
 * Formats the first error or warning message for display.
 *
 * @param errorOrWarning The message could look like any one of the following:
 *   1) A string - 'cannot be blank'
 *   2) An array - ['must contain a digit', 'too long']
 *   3) An object - { id: 'translations.module.id', defaultValue: 'Translated Error' }
 * @param intl
 */
const formatMessage = (errorOrWarning, intl) => {
  if (!errorOrWarning || typeof errorOrWarning === 'string') {
    return errorOrWarning;
  }
  if (Array.isArray(errorOrWarning)) {
    return errorOrWarning.length > 0 && errorOrWarning[0];
  }
  if (intl && typeof errorOrWarning === 'object') {
    return intl.formatMessage(errorOrWarning);
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
        [errorProp]: formatMessage(errorOrWarning, intl),
      }
    : { ...inputProps, ...props };
};

export default mapError;
