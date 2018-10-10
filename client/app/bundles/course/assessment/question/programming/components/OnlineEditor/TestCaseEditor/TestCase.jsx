import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { Field } from 'redux-form';
import { TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'lib/components/redux-form/TextField';
import { grey300 } from 'material-ui/styles/colors';
import styles from '../OnlineEditorView.scss';
import translations from '../OnlineEditorView.intl';

class TestCase extends React.Component {
  static propTypes = {
    fieldPrefix: PropTypes.string.isRequired,
    isLoading: PropTypes.bool.isRequired,
    type: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    enableInlineCodeEditor: PropTypes.bool.isRequired,
    showCodeEditor: PropTypes.bool.isRequired,
    intl: intlShape.isRequired,

    handleDelete: PropTypes.func,
  }

  getTestInputName(field) {
    return `${this.props.fieldPrefix}[${field}]`;
  }

  renderInput(field, placeholder) {
    return (
      <Field
        component={TextField}
        name={this.getTestInputName(field)}
        hintText={placeholder}
        disabled={this.props.isLoading}
        fullWidth
        multiLine
      />
    );
  }

  renderCodeEditorButton(type, index, showCodeEditor) {
    const labelTranslation = showCodeEditor
      ? translations.hideTestCaseCodeEditorButton : translations.showTestCaseCodeEditorButton;

    return (
      <TableRowColumn style={{ paddingLeft: 10, paddingRight: 10 }}>
        <RaisedButton
          className={styles.codeEditorButtonCell}
          label={this.props.intl.formatMessage(labelTranslation)}
          labelPosition="before"
          containerElement="label"
          primary
          disabled={this.props.isLoading}
          style={{ marginRight: 0, width: 30 }}
        />
      </TableRowColumn>
    );
  }

  render() {
    const { type, index, isLoading, enableInlineCodeEditor, showCodeEditor, handleDelete, intl } = this.props;
    const displayedIndex = (`0${index + 1}`).slice(-2);

    return (
      <TableRow>
        <TableHeaderColumn className={styles.deleteButtonCell}>
          <RaisedButton
            backgroundColor={grey300}
            icon={<i className="fa fa-trash" />}
            disabled={isLoading}
            style={{ minWidth: '40px', width: '40px' }}
            onClick={() => handleDelete(index)}
          />
        </TableHeaderColumn>
        <TableRowColumn className={styles.testCell}>
            test_
          {type}
_
          {displayedIndex}
        </TableRowColumn>
        <TableRowColumn className={styles.testCell}>
          { this.renderInput('expression', intl.formatMessage(translations.expressionHeader)) }
        </TableRowColumn>
        <TableRowColumn className={styles.testCell}>
          { this.renderInput('expected', intl.formatMessage(translations.expectedHeader)) }
        </TableRowColumn>
        <TableRowColumn className={styles.testCell}>
          { this.renderInput('hint', intl.formatMessage(translations.hintHeader)) }
        </TableRowColumn>
        { enableInlineCodeEditor ? this.renderCodeEditorButton(type, index, showCodeEditor) : null }
      </TableRow>
    );
  }
}

export default injectIntl(TestCase);
