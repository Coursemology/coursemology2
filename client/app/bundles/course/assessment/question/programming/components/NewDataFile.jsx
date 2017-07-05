import React from 'react';
import PropTypes from 'prop-types';
import {
  TableHeaderColumn, TableRow, TableRowColumn,
} from 'material-ui/Table';
import RaisedButton from 'material-ui/RaisedButton';
import { injectIntl, intlShape } from 'react-intl';
import { grey300 } from 'material-ui/styles/colors';
import styles from './../containers/OnlineEditor/OnlineEditorView.scss';
import translations from './../containers/OnlineEditor/OnlineEditorView.intl';

class NewDataFile extends React.Component {
  static propTypes = {
    index: PropTypes.number.isRequired,
    filename: PropTypes.string,
    showDeleteButton: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool.isRequired,
    intl: intlShape.isRequired,
    updateNewDataFile: PropTypes.func.isRequired,
    deleteNewDataFile: PropTypes.func.isRequired,
  }

  newDataFileChangeHandler(index) {
    return (e) => {
      const files = e.target.files;
      const filename = files.length === 0 ? null : files[0].name;
      this.props.updateNewDataFile(filename, index);
    };
  }

  render() {
    const {
      index, filename, showDeleteButton, isLoading, intl,
    } = this.props;
    let deleteButton = null;
    const addFileButtonStyle = {};
    let rowStyle = { borderBottom: 'none' };

    if (showDeleteButton) {
      deleteButton = (
        <RaisedButton
          backgroundColor={grey300}
          icon={<i className="fa fa-trash" />}
          disabled={isLoading}
          onClick={() => { this.props.deleteNewDataFile(index); }}
          style={{ minWidth: '40px', width: '40px' }}
        />
      );
      addFileButtonStyle.display = 'none';
      rowStyle = {};
    }

    return (
      <TableRow style={rowStyle}>
        <TableHeaderColumn className={styles.deleteButtonCell}>
          { deleteButton }
        </TableHeaderColumn>
        <TableRowColumn>
          <RaisedButton
            className={styles.fileInputButton}
            label={intl.formatMessage(translations.addDataFileButton)}
            labelPosition="before"
            containerElement="label"
            primary
            disabled={isLoading}
            style={addFileButtonStyle}
          >
            <input
              type="file"
              name="question_programming[data_files][]"
              className={styles.uploadInput}
              disabled={isLoading}
              onChange={this.newDataFileChangeHandler(index)}
            />
          </RaisedButton>
          <div style={{ display: 'inline-block' }}>{filename}</div>
        </TableRowColumn>
      </TableRow>
    );
  }
}

export default injectIntl(NewDataFile);
