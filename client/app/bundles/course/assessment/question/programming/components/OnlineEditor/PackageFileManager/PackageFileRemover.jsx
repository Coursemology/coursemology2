import React from 'react';
import { Field } from 'redux-form';
import { injectIntl } from 'react-intl';
import {
  Table, TableBody, TableHeaderColumn, TableRow, TableRowColumn,
} from 'material-ui/Table';
import RaisedButton from 'material-ui/RaisedButton';
import { grey100, grey300, white } from 'material-ui/styles/colors';
import styles from '../OnlineEditorView.scss';

function formatBytes(bytes, decimals) {
  if (bytes === 0) return '0 Byte';
  const k = 1000; // or 1024 for binary
  const dm = decimals || 3;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / (k ** i)).toFixed(dm))} ${sizes[i]}`;
}

class PackageFileRemover extends React.Component {
  static getExistingFiles() {
    const mountNode = document.getElementById('programming-question');
    const data = mountNode.getAttribute('data');
    const props = JSON.parse(data);

    return props.test_ui ? props.test_ui.data_files : [];
  }

  static renderField(props) {
    const { input: { value, onChange }, filename, filesize } = props;

    const buttonClass = value ? 'fa fa-undo' : 'fa fa-trash';
    const buttonColor = value ? white : grey300;
    const rowStyle = value ?
      { textDecoration: 'line-through', backgroundColor: grey100 } : {};

    return (
      <TableRow style={rowStyle}>
        <TableHeaderColumn className={styles.deleteButtonCell}>
          <RaisedButton
            backgroundColor={buttonColor}
            icon={<i className={buttonClass} />}
            onClick={() => { onChange(!value); }}
            style={{ minWidth: '40px', width: '40px' }}
          />
        </TableHeaderColumn>
        <TableRowColumn>{filename}</TableRowColumn>
        <TableRowColumn>{formatBytes(filesize, 2)}</TableRowColumn>
      </TableRow>
    );
  }

  render() {
    return (
      <Table selectable={false}>
        <TableBody displayRowCheckbox={false}>
          {PackageFileRemover.getExistingFiles().map(file => (
            <Field
              name={`question_programming[data_files_to_delete][${file.filename}]`}
              component={PackageFileRemover.renderField}
              filename={file.filename}
              filesize={file.size}
            />
          ))}
        </TableBody>
      </Table>
    );
  }
}

export default injectIntl(PackageFileRemover);
