import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import {
  TableHeaderColumn, TableRow, TableRowColumn,
} from 'material-ui/Table';
import RaisedButton from 'material-ui/RaisedButton';
import { grey100, grey300, white } from 'material-ui/styles/colors';
import styles from './OnlineEditorView.scss';

function formatBytes(bytes, decimals) {
  if (bytes === 0) return '0 Byte';
  const k = 1000; // or 1024 for binary
  const dm = decimals || 3;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / (k ** i)).toFixed(dm))} ${sizes[i]}`;
}

function ExistingPackageFile(props) {
  const { filename, fileType, filesize, toDelete, deleteExistingPackageFile, isLoading, isLast } = props;
  const buttonClass = toDelete ? 'fa fa-undo' : 'fa fa-trash';
  const buttonColor = toDelete ? white : grey300;
  const rowStyle = toDelete ?
    { textDecoration: 'line-through', backgroundColor: grey100 } : {};
  if (isLast) {
    rowStyle.borderBottom = 'none';
  }

  return (
    <TableRow style={rowStyle}>
      <TableHeaderColumn className={styles.deleteButtonCell}>
        <RaisedButton
          backgroundColor={buttonColor}
          icon={<i className={buttonClass} />}
          disabled={isLoading}
          onClick={() => { deleteExistingPackageFile(props.fileType, filename, !toDelete); }}
          style={{ minWidth: '40px', width: '40px' }}
        />
        <input
          type="checkbox"
          hidden
          name={`question_programming[${`${fileType}_to_delete`}][${filename}]`}
          checked={toDelete}
        />
      </TableHeaderColumn>
      <TableRowColumn>{filename}</TableRowColumn>
      <TableRowColumn>{formatBytes(filesize, 2)}</TableRowColumn>
    </TableRow>
  );
}

ExistingPackageFile.propTypes = {
  filename: PropTypes.string.isRequired,
  fileType: PropTypes.string.isRequired,
  filesize: PropTypes.number.isRequired,
  toDelete: PropTypes.bool.isRequired,
  deleteExistingPackageFile: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isLast: PropTypes.bool.isRequired,
};

export default injectIntl(ExistingPackageFile);
