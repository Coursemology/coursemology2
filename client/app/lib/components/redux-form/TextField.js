import TextField from 'material-ui/TextField';
import createComponent from './createComponent';
import mapError from './mapError';

const mapProps = (props) => ({
  floatingLabelFixed: true,
  ...mapError(props),
});

export default createComponent(TextField, mapProps);
