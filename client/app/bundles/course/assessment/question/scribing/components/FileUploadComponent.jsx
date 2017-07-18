import React, { Component } from 'react';
import PropTypes from 'prop-types';
import RaisedButton from 'material-ui/RaisedButton';
import { red500 } from 'material-ui/styles/colors';

import createComponent from 'lib/components/redux-form/createComponent';
import mapError from 'lib/components/redux-form/mapError';

import styles from '../containers/ScribingQuestionForm/ScribingQuestionForm.scss';
import { questionIdPrefix } from '../constants';


const mapProps =
  ({
    input: {
      onChange,
      value,
      ...inputProps
    },
    meta,
    ...props
  }) => ({
    // Take out the required fields and send the rest of the props to mapError().
    ...mapError({ ...props, input: inputProps }),
    value,
    meta,
    onChange: (event) => {
      onChange(event);
    },
  });

const propTypes = {
  field: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  isLoading: PropTypes.bool,
  value: PropTypes.object,
  meta: PropTypes.object,
  onChange: PropTypes.func,
};

const style = {
  fileInputField: {
    display: 'none',
  },
  fileLabel: {
    display: 'inline-block',
  },
  fileLabelError: {
    color: red500,
    display: 'inline-block',
  },
};

class FileUploadComponent extends Component {
  renderFileNameLabel() {
    const fileName = this.props.value && this.props.value[0].name;
    if (fileName) {
      return (<div className="fileLabel" style={style.fileLabel} >{fileName}</div>);
    } else if (this.props.meta && this.props.meta.touched && this.props.meta.invalid && this.props.meta.error) {
      return (
        <div style={style.fileLabelError}>
          { this.props.meta && this.props.meta.touched && this.props.meta.invalid && this.props.meta.error }
        </div>
      );
    }
    return [];
  }

  render() {
    const { field, label, isLoading, onChange } = this.props;

    return (
      <div>
        <RaisedButton
          className={styles.fileInputButton}
          label={label}
          labelPosition="before"
          containerElement="label"
          primary
          disabled={isLoading}
        >
          <input
            id={questionIdPrefix + field}
            type="file"
            accept="image/gif, image/png, image/jpeg, image/pjpeg, application/pdf"
            style={style.fileInputField}
            disabled={isLoading}
            onChange={onChange}
          />
        </RaisedButton>
        { this.renderFileNameLabel() }
      </div>
    );
  }
}

FileUploadComponent.propTypes = propTypes;

export default createComponent(FileUploadComponent, mapProps);
