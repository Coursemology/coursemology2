import Checkbox from 'material-ui/Checkbox';
import createComponent from './createComponent';

export default createComponent(
  Checkbox,
  ({
    input: { onChange, value, ...inputProps },
    meta: _meta,
    intl: _intl,
    onCheck: onCheckFunc,
    ...props
  }) => ({
    ...inputProps,
    ...props,
    checked: !!value,
    onCheck: (_event, isInputChecked) => {
      onChange(isInputChecked);
      if (onCheckFunc && typeof onCheckFunc === 'function') {
        onCheckFunc(isInputChecked);
      }
    },
  }),
);
