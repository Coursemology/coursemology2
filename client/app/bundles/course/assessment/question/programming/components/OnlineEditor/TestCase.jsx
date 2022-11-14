import { Component } from 'react';
import { injectIntl } from 'react-intl';
import { Button, TableCell, TableRow, TextField } from '@mui/material';
import { grey } from '@mui/material/colors';
import { Map } from 'immutable';
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
      <TableCell style={{ paddingLeft: 10, paddingRight: 10 }}>
        {showCodeEditor ? (
          <Button
            className={styles.codeEditorButtonCell}
            color="primary"
            disabled={this.props.isLoading}
            onClick={this.inlineCodeEditorHandler(type, index, !showCodeEditor)}
            style={{ marginRight: 0, width: 30 }}
            variant="contained"
          >
            {this.props.intl.formatMessage(
              translations.hideTestCaseCodeEditorButton,
            )}
          </Button>
        ) : (
          <Button
            className={styles.codeEditorButtonCell}
            color="primary"
            disabled={this.props.isLoading}
            onClick={this.inlineCodeEditorHandler(type, index, !showCodeEditor)}
            style={{ marginRight: 0, width: 30 }}
            variant="contained"
          >
            {this.props.intl.formatMessage(
              translations.showTestCaseCodeEditorButton,
            )}
          </Button>
        )}
      </TableCell>
    );
  }

  renderInput(test, field, placeholder, index) {
    return (
      <TextField
        disabled={this.props.isLoading}
        error={!!test.getIn(['error', field])}
        fullWidth
        helperText={test.getIn(['error', field]) && placeholder}
        InputLabelProps={{
          shrink: true,
        }}
        multiline
        name={TestCase.getTestInputName(this.props.type, field)}
        onChange={(event) => {
          this.props.updateTestCase(
            this.props.type,
            index,
            field,
            event.target.value,
          );
        }}
        type="text"
        value={test.get(field)}
        variant="standard"
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
        <TableCell className={styles.deleteButtonCell}>
          <Button
            disabled={isLoading}
            name={TestCase.getTestInputName(type, 'inlineCode')}
            onClick={this.testCaseDeleteHandler(type, index)}
            style={{
              backgroundColor: grey[300],
              color: 'black',
              height: '40px',
              minWidth: '40px',
              width: '40px',
            }}
            variant="contained"
          >
            <i className="fa fa-trash" />
          </Button>
        </TableCell>
        <TableCell className={styles.testCell}>
          test_
          {type}_{displayedIndex}
        </TableCell>
        <TableCell className={styles.testCell}>
          {this.renderInput(test, 'expression', expression, index)}
        </TableCell>
        <TableCell className={styles.testCell}>
          {this.renderInput(test, 'expected', expected, index)}
        </TableCell>
        <TableCell className={styles.testCell}>
          {this.renderInput(test, 'hint', hint, index)}
        </TableCell>
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
  test: PropTypes.instanceOf(Map).isRequired,
  expression: PropTypes.string.isRequired,
  expected: PropTypes.string.isRequired,
  hint: PropTypes.string.isRequired,
  enableInlineCodeEditor: PropTypes.bool.isRequired,
  showCodeEditor: PropTypes.bool.isRequired,
  intl: PropTypes.object.isRequired,
};

export default injectIntl(TestCase);
