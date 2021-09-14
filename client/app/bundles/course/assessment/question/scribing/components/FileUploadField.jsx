import { Component } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';

import createComponent from 'lib/components/redux-form/createComponent';
import mapError from 'lib/components/redux-form/mapError';

import SingleFileInput, {
  ImagePreview,
} from 'lib/components/redux-form/SingleFileInput';
import { questionNamePrefix, questionIdPrefix } from '../constants';

const mapProps = (props) => ({ ...mapError(props) });

class FileUploadField extends Component {
  render() {
    const { field, label, isLoading, validate } = this.props;
    return (
      <Field
        name={questionNamePrefix + field}
        id={questionIdPrefix + field}
        component={SingleFileInput}
        previewComponent={ImagePreview}
        label={label}
        disabled={isLoading}
        accept="image/gif, image/png, image/jpeg, image/pjpeg, application/pdf"
        validate={validate}
      />
    );
  }
}

FileUploadField.propTypes = {
  field: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  isLoading: PropTypes.bool,
  validate: PropTypes.func,
};

export default createComponent(FileUploadField, mapProps);
