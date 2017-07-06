import Immutable from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import {
  TableHeaderColumn, TableRow, TableRowColumn,
} from 'material-ui/Table';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import { grey300 } from 'material-ui/styles/colors';
import styles from './../containers/OnlineEditor/OnlineEditorView.scss';

class TestCase extends React.Component {
  static propTypes = {
    updateTestCase: PropTypes.func.isRequired,
    deleteTestCase: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    type: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    test: PropTypes.instanceOf(Immutable.Map).isRequired,
    expression: PropTypes.string.isRequired,
    expected: PropTypes.string.isRequired,
    hint: PropTypes.string.isRequired,
  }

  static getTestInputName(type, field) {
    return `question_programming[test_cases][${type}][][${field}]`;
  }

  testCaseDeleteHandler(type, index) {
    return (e) => {
      e.preventDefault();

      if (!this.props.isLoading) {
        this.props.deleteTestCase(this.props.type, index);
      }
    };
  }

  renderInput(test, field, placeholder, index) {
    return (
      <TextField
        type="text"
        name={TestCase.getTestInputName(this.props.type, field)}
        onChange={(e, newValue) => {
          this.props.updateTestCase(this.props.type, index, field, newValue);
        }}
        hintText={placeholder}
        errorText={test.getIn(['error', field])}
        disabled={this.props.isLoading}
        value={test.get(field)}
        fullWidth
        multiLine
      />
    );
  }

  render() {
    const displayedIndex = (`0${this.props.index + 1}`).slice(-2);
    return (
      <TableRow>
        <TableHeaderColumn className={styles.deleteButtonCell}>
          <RaisedButton
            backgroundColor={grey300}
            icon={<i className="fa fa-trash" />}
            disabled={this.props.isLoading}
            onClick={this.testCaseDeleteHandler(this.props.type, this.props.index)}
            style={{ minWidth: '40px', width: '40px' }}
          />
        </TableHeaderColumn>
        <TableRowColumn className={styles.testCell}>
          test_{this.props.type}_{displayedIndex}
        </TableRowColumn>
        <TableRowColumn className={styles.testCell}>
          { this.renderInput(this.props.test, 'expression', this.props.expression, this.props.index) }
        </TableRowColumn>
        <TableRowColumn className={styles.testCell}>
          { this.renderInput(this.props.test, 'expected', this.props.expected, this.props.index) }
        </TableRowColumn>
        <TableRowColumn className={styles.testCell}>
          { this.renderInput(this.props.test, 'hint', this.props.hint, this.props.index) }
        </TableRowColumn>
      </TableRow>
    );
  }
}

export default injectIntl(TestCase);
