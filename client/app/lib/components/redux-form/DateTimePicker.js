import DateTimePicker from 'lib/components/form/DateTimePicker';
import createComponent from './createComponent';
import mapError from './mapError';

const mapProps = ({ input, afterChange, ...props }) => ({
  ...input,
  ...mapError(props),
  value: input.value || undefined,
  onChange: (event, value) => {
    input.onChange(value);
    if (afterChange && typeof afterChange === 'function') {
      afterChange(event, value);
    }
  },
});

export default createComponent(DateTimePicker, mapProps);
