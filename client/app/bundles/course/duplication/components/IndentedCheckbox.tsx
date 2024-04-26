import { FC, ReactNode } from 'react';
import { Checkbox, FormControlLabel } from '@mui/material';

import { indentClassName } from '../constants';

interface Props {
  indentLevel: number;
  children?: ReactNode;
  label: ReactNode;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement>,
    value: boolean,
  ) => void;
}

const IndentedCheckbox: FC<Props> = (props) => {
  const { indentLevel, children, label, checked, disabled, onChange } = props;

  return (
    <div className="flex items-center">
      <FormControlLabel
        className="w-auto mx-0 space-y-0"
        control={
          <Checkbox
            checked={checked}
            className={`${indentClassName[indentLevel]} ${children && 'w-auto'}`}
            disabled={disabled}
            onChange={onChange}
          />
        }
        label={<span>{label}</span>}
      />
      {children}
    </div>
  );
};

export default IndentedCheckbox;
