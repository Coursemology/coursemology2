import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';

import createComponent from 'lib/components/redux-form/createComponent';
import mapError from 'lib/components/redux-form/mapError';

import SingleFileInput from 'lib/components/redux-form/SingleFileInput';
import { questionNamePrefix, questionIdPrefix } from '../constants';


const mapProps = props => ({ ...mapError(props) });

const propTypes = {
  field: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  isLoading: PropTypes.bool,
  validate: PropTypes.func,
};

const FileUploadField = (props) => {
  const { field, label, isLoading, validate } = props;

  return (
    <Field
      name={questionNamePrefix + field}
      id={questionIdPrefix + field}
      component={SingleFileInput}
      isNotBadge
      label={label}
      disabled={isLoading}
      accept="image/gif, image/png, image/jpeg, image/pjpeg, application/pdf"
      validate={validate}
    />
  );
};

FileUploadField.propTypes = propTypes;

export default createComponent(FileUploadField, mapProps);
