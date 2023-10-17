import {
  ChangeEvent,
  ChangeEventHandler,
  ComponentProps,
  FocusEvent,
  FocusEventHandler,
  forwardRef,
} from 'react';

import TextField from './TextField';

type OverridableTextFieldProps = Omit<
  ComponentProps<typeof TextField>,
  'onChange' | 'onBlur'
>;

type NumberTextFieldProps = OverridableTextFieldProps & {
  onBlur?: (e: FocusEvent<HTMLInputElement>, value: number) => void;

  /**
   * When the user is typing, `onChange` will allow inputs of "incomplete" numbers and disallow
   * inputs that lead to invalid numbers (e.g., `'123.4.'`). In doing so, it will always be called
   * with a `string`. It will only be called with a valid `number` on blur.
   *
   * @param value The (maybe) parsed number value.
   */
  onChange?: (e: ChangeEvent<HTMLInputElement>, value: string | number) => void;

  /**
   * The default value to fallback if our number conversion fails.
   */
  fallbackValue?: number;
};

const DEFAULT_FALLBACK_VALUE = 0;

/**
 * Checks if a string is a valid number or is on the way to become a valid number ("incomplete").
 * For example, it will allow,
 * - positive numbers (`'123'`),
 * - minus mark only (`'-'`),
 * - minus mark only in the beginning (`'-123'`),
 * - period only (`'.'`),
 * - numbers with only one period (`'123.'`, `'.123'`, or `'123.1'`), and
 * - worst combinations of the above (`-.123`).
 */
const VALID_INTERMEDIATE_NUMBER_REGEX = /^-?\d*\.?\d*$/;

/**
 * A text field that only accepts the input of numbers, even incompletely. It doesn't support
 * exponential notations (e.g., `'1e3'` or `'1e+3'`), and will never give you up (no `NaN`s).
 */
const NumberTextField = forwardRef<HTMLDivElement, NumberTextFieldProps>(
  (props, ref): JSX.Element => {
    /**
     * We do not parse the number here because `parseFloat` and `Number` both optimistically
     * parse some "incomplete" number values as valid numbers. For example, `parseFloat` will
     * parse `'123.'` as `123`, making it impossible for a user to type in a decimal point.
     * If we want to have `onChange` optimistically parse a number, the parser must return
     * `NaN` for "incomplete" numbers (see `VALID_INTERMEDIATE_NUMBER_REGEX` above).
     */
    const handleChange: ChangeEventHandler<HTMLInputElement> = (e): void => {
      if (!VALID_INTERMEDIATE_NUMBER_REGEX.test(e.target.value)) return;

      props.onChange?.(e, e.target.value);
    };

    const handleBlur: FocusEventHandler<HTMLInputElement> = (e): void => {
      const parsedValue = parseFloat(e.target.value);

      // `Number.isFinite` is used as a validity check because it returns `false` if the
      // value is `NaN` or infinity. Note that if the value is larger than `Number.MAX_VALUE`
      // or smaller than `-Number.MAX_VALUE`, `parseFloat` will return infinity.
      const value = Number.isFinite(parsedValue)
        ? parsedValue
        : props.fallbackValue ?? DEFAULT_FALLBACK_VALUE;

      props.onChange?.(e, value);
      props.onBlur?.(e, value);
    };

    return (
      <TextField
        {...props}
        ref={ref}
        onBlur={handleBlur}
        onChange={handleChange}
        // `type="number"` is highly inconsistent across browsers. See below:
        // https://stackoverflow.blog/2022/09/15/why-the-number-input-is-the-worst-input/
        type="text"
      />
    );
  },
);

NumberTextField.displayName = 'NumberTextField';

export default NumberTextField;
