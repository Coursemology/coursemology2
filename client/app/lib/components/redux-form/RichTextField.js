import MaterialSummernote from '../MaterialSummernote';
import createComponent from './createComponent';
import mapError from './mapError';

const mapProps = (props) => ({ ...mapError(props) });

export default createComponent(MaterialSummernote, mapProps);
