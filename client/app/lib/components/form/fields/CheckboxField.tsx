import { ComponentProps, memo } from 'react';
import { ControllerFieldState } from 'react-hook-form';

import Checkbox from 'lib/components/core/buttons/Checkbox';

import { formatErrorMessage } from './utils/mapError';
import propsAreEqual from './utils/propsAreEqual';

type FormCheckboxFieldProps = ComponentProps<typeof Checkbox> & {
  // react-hook-form ControllerRenderProps requires generics for field
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: any;
  fieldState: ControllerFieldState;
};

const FormCheckboxField = (props: FormCheckboxFieldProps): JSX.Element => {
  const { field, fieldState, ...checkboxProps } = props;

  return (
    <Checkbox
      {...field}
      checked={field.value}
      error={formatErrorMessage(fieldState.error?.message)}
      {...checkboxProps}
    />
  );
};

export default memo(FormCheckboxField, propsAreEqual);
