import { Component } from 'react';
import { injectIntl } from 'react-intl';
import RaisedButton from 'material-ui/RaisedButton';
import { grey300 } from 'material-ui/styles/colors';
import { TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
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
        <RaisedButton
          backgroundColor={grey300}
          disabled={isLoading}
          icon={<i className="fa fa-trash" />}
          onClick={() => {
            this.props.deleteNewPackageFile(this.props.fileType, index);
          }}
          style={{ minWidth: '40px', width: '40px' }}
        />
      );
      addFileButtonStyle.display = 'none';
      rowStyle = {};
    }

    return (
      <TableRow style={rowStyle}>
        <TableHeaderColumn className={styles.deleteButtonCell}>
          {deleteButton}
        </TableHeaderColumn>
        <TableRowColumn>
          <RaisedButton
            className={styles.fileInputButton}
            containerElement="label"
            disabled={isLoading}
            label={this.props.buttonLabel}
            labelPosition="before"
            primary={true}
            style={addFileButtonStyle}
          >
            <input
              className={styles.uploadInput}
              disabled={isLoading}
              name={NewPackageFile.getPackageFileName(this.props.fileType)}
              onChange={this.newPackageFileChangeHandler(index)}
              type="file"
            />
          </RaisedButton>
          <div style={{ display: 'inline-block' }}>{filename}</div>
        </TableRowColumn>
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
