import Immutable from 'immutable';
import { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import { grey300 } from 'material-ui/styles/colors';
import styles from './OnlineEditorView.scss';
import translations from './OnlineEditorView.intl';

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
            label={this.props.intl.formatMessage(
              translations.hideTestCaseCodeEditorButton,
            )}
            labelPosition="before"
            containerElement="label"
            primary
            disabled={this.props.isLoading}
            onClick={this.inlineCodeEditorHandler(type, index, !showCodeEditor)}
            style={{ marginRight: 0, width: 30 }}
          />
        ) : (
          <RaisedButton
            className={styles.codeEditorButtonCell}
            label={this.props.intl.formatMessage(
              translations.showTestCaseCodeEditorButton,
            )}
            labelPosition="before"
            containerElement="label"
            primary
            disabled={this.props.isLoading}
            onClick={this.inlineCodeEditorHandler(type, index, !showCodeEditor)}
            style={{ marginRight: 0, width: 30 }}
          />
        )}
      </TableRowColumn>
    );
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
            name={TestCase.getTestInputName(type, 'inlineCode')}
            backgroundColor={grey300}
            icon={<i className="fa fa-trash" />}
            disabled={isLoading}
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
