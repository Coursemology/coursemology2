import { Component } from 'react';
import { injectIntl } from 'react-intl';
import { Button, TableCell, TableRow } from '@mui/material';
import { grey } from '@mui/material/colors';
import PropTypes from 'prop-types';

import styles from './OnlineEditorView.scss';

class NewPackageFile extends Component {
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
          disabled={isLoading}
          onClick={() => {
            this.props.deleteNewPackageFile(this.props.fileType, index);
          }}
          style={{
            backgroundColor: grey[300],
            color: 'black',
            height: '40px',
            minWidth: '40px',
            width: '40px',
          }}
          variant="contained"
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
            className={styles.fileInputButton}
            color="primary"
            component="label"
            disabled={isLoading}
            style={addFileButtonStyle}
            variant="contained"
          >
            {this.props.buttonLabel}
            <input
              className={styles.uploadInput}
              disabled={isLoading}
              name={NewPackageFile.getPackageFileName(this.props.fileType)}
              onChange={this.newPackageFileChangeHandler(index)}
              type="file"
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
