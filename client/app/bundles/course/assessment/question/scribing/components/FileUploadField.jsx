import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';

import createComponent from 'lib/components/redux-form/createComponent';
import mapError from 'lib/components/redux-form/mapError';

import FileUploadComponent from './FileUploadComponent';
import { questionNamePrefix, questionIdPrefix } from '../constants';


const mapProps = props => ({ ...mapError(props) });

const propTypes = {
  field: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  errorMessage: PropTypes.string.isRequired,
  validate: PropTypes.array,
  isLoading: PropTypes.bool,
};

const FileUploadField = (props) => {
  const { field, label, validate, isLoading, errorMessage } = props;

  return (
    <Field
      name={questionNamePrefix + field}
      id={questionIdPrefix + field}
      disabled={isLoading}
      validate={validate}
      component={fuProps => (<FileUploadComponent
        field={field}
        label={label}
        isLoading={isLoading}
        errorMessage={errorMessage}
        {...fuProps}
      />)}
    />
  );
};

FileUploadField.propTypes = propTypes;

export default createComponent(FileUploadField, mapProps);
