import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import {
  Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn,
} from 'material-ui/Table';

import 'brace/mode/python';
import 'brace/theme/monokai';

import styles from '../OnlineEditorView.scss';
import translations from '../OnlineEditorView.intl';
import TestCase from './TestCase';
import AddTestCaseButton from '../../../containers/AddTestCaseButton';

const propTypes = {
  fields: PropTypes.shape({
    map: PropTypes.func.isRequired,
    get: PropTypes.func.isRequired,
    remove: PropTypes.func.isRequired,
  }).isRequired,
  type: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

class TestCaseTable extends React.Component {
  handleDelete = (index) => {
    const { fields } = this.props;
    fields.remove(index);
  }

  render() {
    const { fields, type, intl } = this.props;

    return (
      <Table selectable={false}>
        <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
          <TableRow>
            <TableHeaderColumn className={styles.deleteButtonCell} />
            <TableHeaderColumn>{intl.formatMessage(translations.identifierHeader)}</TableHeaderColumn>
            <TableHeaderColumn>{intl.formatMessage(translations.expressionHeader)}</TableHeaderColumn>
            <TableHeaderColumn>{intl.formatMessage(translations.expectedHeader)}</TableHeaderColumn>
            <TableHeaderColumn>{intl.formatMessage(translations.hintHeader)}</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
          {fields.map((member, index) => (
            <TestCase type={type} index={index} fieldPrefix={member} handleDelete={this.handleDelete} />
          ))}
        </TableBody>
        <TableFooter adjustForCheckbox={false}>
          <TableRow>
            <TableRowColumn colSpan="5" style={{ textAlign: 'center' }}>
              <AddTestCaseButton
                label={intl.formatMessage(translations.addNewTestButton)}
                onClick={() => fields.push({})}
              />
            </TableRowColumn>
          </TableRow>
        </TableFooter>
      </Table>
    );
  }
}

TestCaseTable.propTypes = propTypes;

export default injectIntl(TestCaseTable);
