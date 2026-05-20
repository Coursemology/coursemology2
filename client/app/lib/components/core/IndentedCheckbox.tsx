import { CSSProperties, FC, ReactNode } from 'react';
import { Checkbox, CheckboxProps, FormControlLabel } from '@mui/material';

const styles = {
  tabSize: 15,
};

interface IndentedCheckboxProps extends CheckboxProps {
  indentLevel?: number;
  children?: ReactNode;
  label: JSX.Element | string;
}

const IndentedCheckbox: FC<IndentedCheckboxProps> = ({
  indentLevel = 0,
  children = [],
  label,
  ...props
}) => {
  const checkboxStyle: CSSProperties = {
    marginLeft: indentLevel * styles.tabSize,
  };
  if (children && Array.isArray(children) && children.length > 0) {
    checkboxStyle.width = 'auto';
  }

  return (
    <div className="flex items-center">
      <FormControlLabel
        className="py-2 px-0 w-auto"
        control={
          <Checkbox className="py-0 px-2" style={checkboxStyle} {...props} />
        }
        label={<b>{label}</b>}
      />
      {children}
    </div>
  );
};

export default IndentedCheckbox;
