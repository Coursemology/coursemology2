import AceEditor from 'react-ace';
import createComponent from './createComponent';

const mapProps = ({ input, filename, ...props }) => ({
  value: input.value,
  onChange: input.onChange,
  name: filename,
  ...props,
});

export default createComponent(AceEditor, mapProps);
