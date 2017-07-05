import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import {
  TableHeader, TableHeaderColumn, TableRow, TableRowColumn,
} from 'material-ui/Table';
import RaisedButton from 'material-ui/RaisedButton';
import styles from './OnlineEditorView.scss';
import { grey100, grey300, white } from 'material-ui/styles/colors';
import { formatBytes } from './../reducers/utils';

class ExistingDataFile extends React.Component {
  static propTypes = {
    filename: PropTypes.string.isRequired,
    filesize: PropTypes.number.isRequired,
    toDelete: PropTypes.bool.isRequired,
    deleteExistingDataFile: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    isLast: PropTypes.bool.isRequired
  };

  render() {
    // const filename = this.props.data.get('filename');
    // const filesize = this.props.data.get('size');
    const { filename, filesize, data, toDelete, deleteExistingDataFile, isLast } = this.props;
    const buttonClass = toDelete ? 'fa fa-undo' : 'fa fa-trash';
    const buttonColor = toDelete ? white : grey300;
    let rowStyle = toDelete ?
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
            disabled={this.props.isLoading}
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
};

export default injectIntl(ExistingDataFile)
