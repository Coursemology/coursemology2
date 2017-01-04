import Immutable from 'immutable';

import React, { PropTypes } from 'react';
import AceEditor from 'react-ace';
import { injectIntl } from 'react-intl';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import Toggle from 'material-ui/Toggle';
import { Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import transitions from 'material-ui/styles/transitions';
import { red500 } from 'material-ui/styles/colors';

import 'brace/mode/python';
import 'brace/theme/monokai';

import styles from './OnlineEditorPythonView.scss';
import translations from './OnlineEditorPythonView.intl';

const propTypes = {
  data: PropTypes.instanceOf(Immutable.Map).isRequired,
  actions: React.PropTypes.shape({
    updatePythonCodeBlock: PropTypes.func.isRequired,
    createPythonTestCase: PropTypes.func.isRequired,
    updatePythonTestCase: PropTypes.func.isRequired,
    deletePythonTestCase: PropTypes.func.isRequired,
  }),
  isLoading: PropTypes.bool.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

const contextTypes = {
  muiTheme: React.PropTypes.object.isRequired,
};

export function validation(data, pathOfKeysToData, intl) {
  const errors = [];

  if (data.get('autograded')) {
    let testsCount = 0;

    ['public', 'private', 'evaluation'].forEach((type) => {
      const testCases = data.getIn(['test_cases', type]);
      testsCount += testCases.size;

      testCases.forEach((testCase, index) => {
        const testCaseError = {};
        let hasError = false;

        if (testCase.get('expression').trim() === '') {
          testCaseError.expression =
            intl.formatMessage(translations.cannotBeBlankValidationError);
          hasError = true;
        }
        if (testCase.get('expected').trim() === '') {
          testCaseError.expected =
            intl.formatMessage(translations.cannotBeBlankValidationError);
          hasError = true;
        }

        if (hasError) {
          errors.push({
            path: pathOfKeysToData.concat(['test_cases', type, index, 'error']),
            error: testCaseError,
          });
        }
      });
    });

    if (testsCount === 0) {
      errors.push({
        path: pathOfKeysToData.concat(['test_cases', 'error']),
        error: intl.formatMessage(translations.noTestCaseErrorAlert),
      });
    }
  }

  return errors;
}

class OnlineEditorPythonView extends React.Component {

  static getInputName(field) {
    return `question_programming[${field}]`;
  }

  static getTestInputName(type, field) {
    return `question_programming[test_cases][${type}][][${field}]`;
  }

  constructor(props) {
    super(props);
    this.onAutogradedChange = this.onAutogradedChange.bind(this);
  }

  onAutogradedChange(e) {
    this.props.actions.updatePythonCodeBlock('autograded', e.target.checked);
  }

  codeChangeHandler(field) {
    return e => this.props.actions.updatePythonCodeBlock(field, e);
  }

  testCaseDeleteHandler(type, index) {
    return (e) => {
      e.preventDefault();

      if (!this.props.isLoading) {
        this.props.actions.deletePythonTestCase(type, index);
      }
    };
  }

  testCaseCreateHandler(type) {
    return (e) => {
      e.preventDefault();

      if (!this.props.isLoading) {
        this.props.actions.createPythonTestCase(type);
      }
    };
  }

  renderTestCases(header, testCases, type, startIndex = 0) {
    const renderInput = (test, field, placeholder, index) => (
      <TextField
        type="text"
        name={OnlineEditorPythonView.getTestInputName(type, field)}
        onChange={(e, newValue) => {
          this.props.actions.updatePythonTestCase(type, index, field, newValue);
        }}
        hintText={placeholder}
        errorText={test.getIn(['error', field])}
        disabled={this.props.isLoading}
        value={test.get(field)}
        fullWidth
        multiLine
      />
    );

    const identifier = this.props.intl.formatMessage(translations.identifierHeader);
    const expression = this.props.intl.formatMessage(translations.expressionHeader);
    const expected = this.props.intl.formatMessage(translations.expectedHeader);
    const hint = this.props.intl.formatMessage(translations.hintHeader);

    const rows = [...testCases.get(type).entries()].map(([index, test]) => (
      <TableRow key={index}>
        <TableHeaderColumn className={styles.deleteButtonCell}>
          <RaisedButton
            backgroundColor={red500}
            icon={<i className="fa fa-minus" />}
            disabled={this.props.isLoading}
            onClick={this.testCaseDeleteHandler(type, index)}
            style={{ minWidth: '40px', width: '40px' }}
          />
        </TableHeaderColumn>
        <TableRowColumn className={styles.testCell}>
          test_{type}_{startIndex + index + 1}
        </TableRowColumn>
        <TableRowColumn className={styles.testCell}>
          { renderInput(test, 'expression', expression, index) }
        </TableRowColumn>
        <TableRowColumn className={styles.testCell}>
          { renderInput(test, 'expected', expected, index) }
        </TableRowColumn>
        <TableRowColumn className={styles.testCell}>
          { renderInput(test, 'hint', hint, index) }
        </TableRowColumn>
      </TableRow>
    ));

    return (
      <Card initiallyExpanded>
        <CardHeader
          title={header}
          textStyle={{ fontWeight: 'bold' }}
          actAsExpander
          showExpandableButton
        />
        <CardText expandable style={{ padding: 0 }}>
          <Table selectable={false}>
            <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
              <TableRow>
                <TableHeaderColumn className={styles.deleteButtonCell} />
                <TableHeaderColumn>{identifier}</TableHeaderColumn>
                <TableHeaderColumn>{expression}</TableHeaderColumn>
                <TableHeaderColumn>{expected}</TableHeaderColumn>
                <TableHeaderColumn>{hint}</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false}>
              {rows}
            </TableBody>
            <TableFooter adjustForCheckbox={false}>
              <TableRow>
                <TableRowColumn colSpan="5" style={{ textAlign: 'center' }}>
                  <FlatButton
                    label={this.props.intl.formatMessage(translations.addNewTestButton)}
                    icon={<i className="fa fa-plus" />}
                    disabled={this.props.isLoading}
                    onClick={this.testCaseCreateHandler(type)}
                  />
                </TableRowColumn>
              </TableRow>
            </TableFooter>
          </Table>
        </CardText>
      </Card>
    );
  }

  renderEditorCard(header, field) {
    return (
      <Card containerStyle={{ paddingBottom: 0 }} initiallyExpanded>
        <CardHeader
          title={header}
          textStyle={{ fontWeight: 'bold' }}
          actAsExpander
          showExpandableButton
        />
        <CardText expandable style={{ padding: 0 }}>
          <textarea
            name={OnlineEditorPythonView.getInputName(field)}
            value={this.props.data.get(field)}
            style={{ display: 'none' }}
            readOnly="true"
          />
          <AceEditor
            mode="python"
            theme="monokai"
            width="100%"
            minLines={10}
            maxLines={Math.max(20, this.props.data.get(field).split(/\r\n|\r|\n/).length)}
            name={OnlineEditorPythonView.getInputName(field)}
            value={this.props.data.get(field)}
            onChange={this.codeChangeHandler(field)}
            editorProps={{ $blockScrolling: true }}
            setOptions={{ useSoftTabs: true, readOnly: this.props.isLoading }}
          />
        </CardText>
      </Card>
    );
  }

  renderAutogradedFields() {
    const { intl, data } = this.props;
    const testCases = data.get('test_cases');
    const testCaseError = data.getIn(['test_cases', 'error']);
    const errorTextElement = testCaseError && (
    <div
      style={{
        fontSize: 12,
        lineHeight: '12px',
        color: this.context.muiTheme.textField.errorColor,
        transition: transitions.easeOut(),
        marginBottom: '1em',
      }}
    >
      {testCaseError}
    </div>
      );

    return (
      <div>
        <div style={{ marginBottom: '1em' }}>
          { this.renderEditorCard(intl.formatMessage(translations.solutionTitle), 'solution') }
          { this.renderEditorCard(intl.formatMessage(translations.prependTitle), 'prepend') }
          { this.renderEditorCard(intl.formatMessage(translations.appendTitle), 'append') }
        </div>
        <h3>{ intl.formatMessage(translations.testCasesHeader) }</h3>
        { errorTextElement }
        {this.renderTestCases(intl.formatMessage(translations.publicTestCases),
          testCases, 'public')}
        {this.renderTestCases(intl.formatMessage(translations.privateTestCases),
          testCases, 'private', testCases.get('public').size)}
        {this.renderTestCases(intl.formatMessage(translations.evaluationTestCases),
          testCases, 'evaluation',
          testCases.get('public').size + testCases.get('private').size)}
      </div>
    );
  }

  render() {
    const { intl, data } = this.props;
    const autograded = data.get('autograded');

    return (
      <div id="python-online-editor">
        <Toggle
          label={intl.formatMessage(translations.autograded)}
          labelPosition="right"
          toggled={autograded}
          onToggle={this.onAutogradedChange}
          disabled={this.props.isLoading}
          style={{ margin: '1em 0' }}
        />
        { this.renderEditorCard(intl.formatMessage(translations.submissionTitle), 'submission') }
        { autograded ? this.renderAutogradedFields() : null }
      </div>
    );
  }
}

OnlineEditorPythonView.propTypes = propTypes;
OnlineEditorPythonView.contextTypes = contextTypes;

export default injectIntl(OnlineEditorPythonView);
