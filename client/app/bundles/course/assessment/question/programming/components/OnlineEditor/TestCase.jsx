import { Component } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import Immutable from 'immutable';
import RaisedButton from 'material-ui/RaisedButton';
import { grey300 } from 'material-ui/styles/colors';
import { TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import TextField from 'material-ui/TextField';
import PropTypes from 'prop-types';

import translations from './OnlineEditorView.intl';
import styles from './OnlineEditorView.scss';

class TestCase extends Component {
  static getTestInputName(type, field) {
    return `question_programming[test_cases][${type}][][${field}]`;
  }

  inlineCodeEditorHandler(type, index, newValue) {
    return (e) => {
      e.preventDefault();
      if (!this.props.isLoading) {
        this.props.updateTestCase(type, index, 'show_code_editor', newValue);
      }
    };
  }

  testCaseDeleteHandler(type, index) {
    return (e) => {
      e.preventDefault();

      if (!this.props.isLoading) {
        this.props.deleteTestCase(this.props.type, index);
      }
    };
  }

  renderCodeEditorButton(type, index, showCodeEditor) {
    return (
      <TableRowColumn style={{ paddingLeft: 10, paddingRight: 10 }}>
        {showCodeEditor ? (
          <RaisedButton
            className={styles.codeEditorButtonCell}
            containerElement="label"
            disabled={this.props.isLoading}
            label={this.props.intl.formatMessage(
              translations.hideTestCaseCodeEditorButton,
            )}
            labelPosition="before"
            onClick={this.inlineCodeEditorHandler(type, index, !showCodeEditor)}
            primary={true}
            style={{ marginRight: 0, width: 30 }}
          />
        ) : (
          <RaisedButton
            className={styles.codeEditorButtonCell}
            containerElement="label"
            disabled={this.props.isLoading}
            label={this.props.intl.formatMessage(
              translations.showTestCaseCodeEditorButton,
            )}
            labelPosition="before"
            onClick={this.inlineCodeEditorHandler(type, index, !showCodeEditor)}
            primary={true}
            style={{ marginRight: 0, width: 30 }}
          />
        )}
      </TableRowColumn>
    );
  }

  renderInput(test, field, placeholder, index) {
    return (
      <TextField
        disabled={this.props.isLoading}
        errorText={test.getIn(['error', field])}
        fullWidth={true}
        hintText={placeholder}
        multiLine={true}
        name={TestCase.getTestInputName(this.props.type, field)}
        onChange={(e, newValue) => {
          this.props.updateTestCase(this.props.type, index, field, newValue);
        }}
        type="text"
        value={test.get(field)}
      />
    );
  }

  render() {
    const displayedIndex = `0${this.props.index + 1}`.slice(-2);
    const {
      type,
      index,
      isLoading,
      test,
      expression,
      expected,
      hint,
      enableInlineCodeEditor,
      showCodeEditor,
    } = this.props;
    return (
      <TableRow>
        <TableHeaderColumn className={styles.deleteButtonCell}>
          <RaisedButton
            backgroundColor={grey300}
            disabled={isLoading}
            icon={<i className="fa fa-trash" />}
            name={TestCase.getTestInputName(type, 'inlineCode')}
            onClick={this.testCaseDeleteHandler(type, index)}
            style={{ minWidth: '40px', width: '40px' }}
          />
        </TableHeaderColumn>
        <TableRowColumn className={styles.testCell}>
          test_
          {type}_{displayedIndex}
        </TableRowColumn>
        <TableRowColumn className={styles.testCell}>
          {this.renderInput(test, 'expression', expression, index)}
        </TableRowColumn>
        <TableRowColumn className={styles.testCell}>
          {this.renderInput(test, 'expected', expected, index)}
        </TableRowColumn>
        <TableRowColumn className={styles.testCell}>
          {this.renderInput(test, 'hint', hint, index)}
        </TableRowColumn>
        {enableInlineCodeEditor
          ? this.renderCodeEditorButton(type, index, showCodeEditor)
          : null}
      </TableRow>
    );
  }
}

TestCase.propTypes = {
  updateTestCase: PropTypes.func.isRequired,
  deleteTestCase: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  type: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  test: PropTypes.instanceOf(Immutable.Map).isRequired,
  expression: PropTypes.string.isRequired,
  expected: PropTypes.string.isRequired,
  hint: PropTypes.string.isRequired,
  enableInlineCodeEditor: PropTypes.bool.isRequired,
  showCodeEditor: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(TestCase);
