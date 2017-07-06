import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import {
  TableHeaderColumn, TableRow, TableRowColumn,
} from 'material-ui/Table';
import RaisedButton from 'material-ui/RaisedButton';
import { grey100, grey300, white } from 'material-ui/styles/colors';
import styles from './../containers/OnlineEditor/OnlineEditorView.scss';
import { formatBytes } from './../reducers/utils';

function ExistingDataFile(props) {
  const { filename, filesize, toDelete, deleteExistingDataFile, isLoading, isLast } = props;
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
          onClick={() => { deleteExistingDataFile(filename, !toDelete); }}
          style={{ minWidth: '40px', width: '40px' }}
        />
        <input
          type="checkbox"
          hidden
          name={`question_programming[data_files_to_delete][${filename}]`}
          checked={toDelete}
        />
      </TableHeaderColumn>
      <TableRowColumn>{filename}</TableRowColumn>
      <TableRowColumn>{formatBytes(filesize, 2)}</TableRowColumn>
    </TableRow>
  );
}

ExistingDataFile.propTypes = {
  filename: PropTypes.string.isRequired,
  filesize: PropTypes.number.isRequired,
  toDelete: PropTypes.bool.isRequired,
  deleteExistingDataFile: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isLast: PropTypes.bool.isRequired,
};

export default injectIntl(ExistingDataFile);
