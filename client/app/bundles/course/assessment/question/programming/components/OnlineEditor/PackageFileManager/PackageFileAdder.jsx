import React from 'react';
import PropTypes from 'prop-types';
import {
  Table, TableBody, TableRow, TableRowColumn, TableFooter,
} from 'material-ui/Table';
import RaisedButton from 'material-ui/RaisedButton';
import { injectIntl, intlShape } from 'react-intl';
import { grey300 } from 'material-ui/styles/colors';
import styles from '../OnlineEditorView.scss';
import translations from '../OnlineEditorView.intl';

class PackageFileAdder extends React.Component {
  static propTypes = {
    input: PropTypes.shape({
      onChange: PropTypes.func,
      value: PropTypes.arrayOf(PropTypes.object),
    }).isRequired,
    intl: intlShape.isRequired,
  };

  handleFileInput = (e) => {
    const { input: { value, onChange } } = this.props;

    onChange([...value, ...e.target.files]);
  }

  handleDelete = (index) => {
    const { input: { value, onChange } } = this.props;

    onChange([
      ...value.slice(0, index),
      ...value.slice(index + 1),
    ]);
  }

  renderFiles() {
    /* eslint-disable react/no-array-index-key */
    const { input: { value } } = this.props;

    return value.map((file, index) => (
      <TableRow key={index}>
        <TableRowColumn className={styles.deleteButtonCell}>
          <RaisedButton
            backgroundColor={grey300}
            icon={<i className="fa fa-trash" />}
            onClick={() => this.handleDelete(index)}
            style={{ minWidth: '40px', width: '40px' }}
          />
        </TableRowColumn>
        <TableRowColumn>{file.name}</TableRowColumn>
      </TableRow>
    ));
    /* eslint-enable react/no-array-index-key */
  }

  render() {
    const { intl } = this.props;

    return (
      <Table selectable={false}>
        <TableBody displayRowCheckbox={false}>
          {this.renderFiles()}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableRowColumn className={styles.deleteButtonCell} />
            <TableRowColumn>
              <RaisedButton
                className={styles.fileInputButton}
                label={intl.formatMessage(translations.addDataFileButton)}
                labelPosition="before"
                containerElement="label"
                primary
              >
                <input
                  type="file"
                  className={styles.uploadInput}
                  onChange={this.handleFileInput}
                  multiple
                />
              </RaisedButton>
            </TableRowColumn>
          </TableRow>
        </TableFooter>
      </Table>
    );
  }
}

export default injectIntl(PackageFileAdder);
