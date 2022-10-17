import { isNaN } from 'lodash';
import {
  ChangeEvent,
  ChangeEventHandler,
  ComponentProps,
  FocusEvent,
  FocusEventHandler,
  forwardRef,
} from 'react';

import TextField from './TextField';

type NumberTextFieldProps = Omit<
  ComponentProps<typeof TextField>,
  'onChange' | 'onBlur'
> & {
  onChange?: (event: ChangeEvent<HTMLInputElement>, value: '' | number) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>, value: number) => void;
};

const isValidInteger = (value: number): boolean =>
  !isNaN(value) &&
  value >= Number.MIN_SAFE_INTEGER &&
  value <= Number.MAX_SAFE_INTEGER;

const NumberTextField = forwardRef<HTMLDivElement, NumberTextFieldProps>(
  (props, ref): JSX.Element => {
    const handleChange: ChangeEventHandler<HTMLInputElement> = (e): void => {
      const numberValue = parseInt(e.target.value, 10);
      if (isValidInteger(numberValue)) props.onChange?.(e, numberValue);
      if (isNaN(numberValue)) props.onChange?.(e, '');
    };

    const handleBlur: FocusEventHandler<HTMLInputElement> = (e): void => {
      const numberValue = parseInt(e.target.value, 10) || 0;
      if (isValidInteger(numberValue)) props.onChange?.(e, numberValue);
    };

    // type="number" is highly inconsistent across browsers. See below:
    // https://stackoverflow.blog/2022/09/15/why-the-number-input-is-the-worst-input/
    return (
      <TextField
        {...props}
        ref={ref}
        type="text"
        onChange={handleChange}
        onBlur={handleBlur}
      />
    );
  },
);

NumberTextField.displayName = 'NumberTextField';

export default NumberTextField;
