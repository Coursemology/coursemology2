import PropTypes from 'prop-types';
import { Field } from 'redux-form';

import createComponent from 'lib/components/redux-form/createComponent';
import mapError from 'lib/components/redux-form/mapError';
import SingleFileInput, {
  ImagePreview,
} from 'lib/components/redux-form/SingleFileInput';

import { questionIdPrefix, questionNamePrefix } from '../constants';

const mapProps = (props) => ({ ...mapError(props) });

const FileUploadField = (props) => {
  const { field, label, isLoading, validate } = props;
  return (
    <Field
      accept="image/gif, image/png, image/jpeg, image/pjpeg, application/pdf"
      component={SingleFileInput}
      disabled={isLoading}
      id={questionIdPrefix + field}
      label={label}
      name={questionNamePrefix + field}
      previewComponent={ImagePreview}
      validate={validate}
    />
  );
};

FileUploadField.propTypes = {
  field: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  isLoading: PropTypes.bool,
  validate: PropTypes.func,
};

export default createComponent(FileUploadField, mapProps);
