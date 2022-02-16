import React from 'react';
import PropTypes from 'prop-types';
import { Button, TableCell, TableRow } from '@material-ui/core';
import { injectIntl } from 'react-intl';
import { grey } from '@material-ui/core/colors';
import styles from './OnlineEditorView.scss';

class NewPackageFile extends React.Component {
  static getPackageFileName(fileType) {
    return `question_programming[${fileType}][]`;
  }

  newPackageFileChangeHandler(index) {
    return (e) => {
      const files = e.target.files;
      const filename = files.length === 0 ? null : files[0].name;
      this.props.updateNewPackageFile(this.props.fileType, filename, index);
    };
  }

  render() {
    const { index, filename, showDeleteButton, isLoading } = this.props;
    let deleteButton = null;
    const addFileButtonStyle = {};
    let rowStyle = { borderBottom: 'none' };

    if (showDeleteButton) {
      deleteButton = (
        <Button
          variant="contained"
          disabled={isLoading}
          onClick={() => {
            this.props.deleteNewPackageFile(this.props.fileType, index);
          }}
          style={{
            backgroundColor: grey[300],
            height: '40px',
            minWidth: '40px',
            width: '40px',
          }}
        >
          <i className="fa fa-trash" />
        </Button>
      );
      addFileButtonStyle.display = 'none';
      rowStyle = {};
    }

    return (
      <TableRow style={rowStyle}>
        <TableCell className={styles.deleteButtonCell}>
          {deleteButton}
        </TableCell>
        <TableCell>
          <Button
            variant="contained"
            color="primary"
            component="label"
            className={styles.fileInputButton}
            disabled={isLoading}
            style={addFileButtonStyle}
          >
            {this.props.buttonLabel}
            <input
              type="file"
              name={NewPackageFile.getPackageFileName(this.props.fileType)}
              className={styles.uploadInput}
              disabled={isLoading}
              onChange={this.newPackageFileChangeHandler(index)}
            />
          </Button>
          <div style={{ display: 'inline-block' }}>{filename}</div>
        </TableCell>
      </TableRow>
    );
  }
}

NewPackageFile.propTypes = {
  index: PropTypes.number.isRequired,
  fileType: PropTypes.string.isRequired,
  filename: PropTypes.string,
  showDeleteButton: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  updateNewPackageFile: PropTypes.func.isRequired,
  deleteNewPackageFile: PropTypes.func.isRequired,
  buttonLabel: PropTypes.string.isRequired,
};

export default injectIntl(NewPackageFile);
