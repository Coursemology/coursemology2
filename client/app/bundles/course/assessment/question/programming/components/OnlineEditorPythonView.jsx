import Immutable from 'immutable';

import React from 'react';
import PropTypes from 'prop-types';
import AceEditor from 'react-ace';
import { injectIntl, FormattedMessage, intlShape } from 'react-intl';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import {
  Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn,
} from 'material-ui/Table';
import transitions from 'material-ui/styles/transitions';
import { grey100, grey300, white } from 'material-ui/styles/colors';

import 'brace/mode/python';
import 'brace/theme/monokai';

import styles from './OnlineEditorPythonView.scss';
import translations from './OnlineEditorPythonView.intl';

const MAX_TEST_CASES = 99;

const propTypes = {
  data: PropTypes.instanceOf(Immutable.Map).isRequired,
  dataFiles: PropTypes.instanceOf(Immutable.Map).isRequired,
  actions: PropTypes.shape({
    updatePythonCodeBlock: PropTypes.func.isRequired,
    createPythonTestCase: PropTypes.func.isRequired,
    updatePythonTestCase: PropTypes.func.isRequired,
    deletePythonTestCase: PropTypes.func.isRequired,
    updateNewDataFile: PropTypes.func.isRequired,
    deleteNewDataFile: PropTypes.func.isRequired,
    deleteExistingDataFile: PropTypes.func.isRequired,
  }),
  isLoading: PropTypes.bool.isRequired,
  autograded: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
};

const contextTypes = {
  muiTheme: PropTypes.object.isRequired,
};

export function validation(data, pathOfKeysToData, intl) {
  const errors = [];
  const pythonData = data.getIn(pathOfKeysToData);

  if (data.getIn(['question', 'autograded'])) {
    let testsCount = 0;

    ['public', 'private', 'evaluation'].forEach((type) => {
      const testCases = pythonData.getIn(['test_cases', type]);
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

  codeChangeHandler(field) {
    return e => this.props.actions.updatePythonCodeBlock(field, e);
  }

  newDataFileChangeHandler(index) {
    return (e) => {
      const files = e.target.files;
      const filename = files.length === 0 ? null : files[0].name;
      this.props.actions.updateNewDataFile(filename, index);
    };
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

  renderExistingDataFiles = () => {
    if (this.props.data.get('data_files').size === 0) {
      return null;
    }

    const formatBytes = (bytes, decimals) => {
      if (bytes === 0) return '0 Byte';
      const k = 1000; // or 1024 for binary
      const dm = decimals || 3;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return `${parseFloat((bytes / (k ** i)).toFixed(dm))} ${sizes[i]}`;
    };

    const renderDataFile = (fileData) => {
      const filename = fileData.get('filename');
      const filesize = fileData.get('size');
      const hash = fileData.get('hash');
      const toDelete = this.props.dataFiles.get('to_delete').has(filename);
      const buttonClass = toDelete ? 'fa fa-undo' : 'fa fa-trash';
      const buttonColor = toDelete ? white : grey300;
      const rowStyle = toDelete ?
        { textDecoration: 'line-through', backgroundColor: grey100 }
        :
        {};

      return (
        <TableRow key={hash} style={rowStyle}>
          <TableHeaderColumn className={styles.deleteButtonCell}>
            <RaisedButton
              backgroundColor={buttonColor}
              icon={<i className={buttonClass} />}
              disabled={this.props.isLoading}
              onClick={() => { this.props.actions.deleteExistingDataFile(filename, !toDelete); }}
              style={{ minWidth: '40px', width: '40px' }}
            />
            <input
              type="checkbox"
              hidden
              name={`question_programming[data_files_to_delete][${filename}]`}
              checked={toDelete}
            />
          </TableHeaderColumn>
          <TableRowColumn>{filename}</TableRowColumn>
          <TableRowColumn>{formatBytes(filesize, 2)}</TableRowColumn>
        </TableRow>
      );
    };

    return (
      <Card initiallyExpanded>
        <CardHeader
          title={this.props.intl.formatMessage(translations.currentDataFilesHeader)}
          textStyle={{ fontWeight: 'bold' }}
          actAsExpander
          showExpandableButton
        />
        <CardText expandable style={{ padding: 0 }}>
          <Table selectable={false}>
            <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
              <TableRow>
                <TableHeaderColumn className={styles.deleteButtonCell} />
                <TableHeaderColumn>
                  {this.props.intl.formatMessage(translations.fileNameHeader)}
                </TableHeaderColumn>
                <TableHeaderColumn>
                  {this.props.intl.formatMessage(translations.fileSizeHeader)}
                </TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false}>
              {this.props.data.get('data_files').map(renderDataFile)}
            </TableBody>
          </Table>
        </CardText>
      </Card>
    );
  }

  renderNewDataFiles() {
    const newDataFilesRows = this.props.dataFiles.get('new').map((fileData, index) => {
      const key = fileData.get('key');

      let deleteButton = null;
      const addFileButtonStyle = {};

      if (this.props.dataFiles.get('key') !== key) {
        // Do not show for last row
        deleteButton = (
          <RaisedButton
            backgroundColor={grey300}
            icon={<i className="fa fa-trash" />}
            disabled={this.props.isLoading}
            onClick={() => { this.props.actions.deleteNewDataFile(index); }}
            style={{ minWidth: '40px', width: '40px' }}
          />
        );
        // Hide button after selecting a file
        addFileButtonStyle.display = 'none';
      }

      return (
        <TableRow key={key}>
          <TableHeaderColumn className={styles.deleteButtonCell}>
            { deleteButton }
          </TableHeaderColumn>
          <TableRowColumn>
            <RaisedButton
              className={styles.fileInputButton}
              label={this.props.intl.formatMessage(translations.addDataFileButton)}
              labelPosition="before"
              containerElement="label"
              primary
              disabled={this.props.isLoading}
              style={addFileButtonStyle}
            >
              <input
                type="file"
                name="question_programming[data_files][]"
                className={styles.uploadInput}
                disabled={this.props.isLoading}
                onChange={this.newDataFileChangeHandler(index)}
              />
            </RaisedButton>
            <div style={{ display: 'inline-block' }}>{fileData.get('filename')}</div>
          </TableRowColumn>
        </TableRow>
      );
    });

    return (
      <Card initiallyExpanded>
        <CardHeader
          title={this.props.intl.formatMessage(translations.newDataFilesHeader)}
          textStyle={{ fontWeight: 'bold' }}
          actAsExpander
          showExpandableButton
        />
        <CardText expandable style={{ padding: 0 }}>
          <Table selectable={false}>
            <TableBody displayRowCheckbox={false}>
              { newDataFilesRows }
            </TableBody>
          </Table>
        </CardText>
      </Card>
    );
  }

  renderTestCases(header, testCases, type) {
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

    const allTestCases = this.props.data.get('test_cases');
    const numAllTestCases = allTestCases.get('public').size + allTestCases.get('private').size
      + allTestCases.get('evaluation').size;

    const identifier = this.props.intl.formatMessage(translations.identifierHeader);
    const expression = this.props.intl.formatMessage(translations.expressionHeader);
    const expected = this.props.intl.formatMessage(translations.expectedHeader);
    const hint = this.props.intl.formatMessage(translations.hintHeader);

    const rows = [...testCases.get(type).entries()].map(([index, test]) => {
      const displayedIndex = (`0${index + 1}`).slice(-2);
      return (
        <TableRow key={index}>
          <TableHeaderColumn className={styles.deleteButtonCell}>
            <RaisedButton
              backgroundColor={grey300}
              icon={<i className="fa fa-trash" />}
              disabled={this.props.isLoading}
              onClick={this.testCaseDeleteHandler(type, index)}
              style={{ minWidth: '40px', width: '40px' }}
            />
          </TableHeaderColumn>
          <TableRowColumn className={styles.testCell}>
            test_{type}_{displayedIndex}
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
      );
    });

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
                    disabled={this.props.isLoading || numAllTestCases >= MAX_TEST_CASES}
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

  renderEditorCard(header, subtitle, field) {
    const value = this.props.data.get(field) || '';

    return (
      <Card containerStyle={{ paddingBottom: 0 }} initiallyExpanded>
        <CardHeader
          title={header}
          textStyle={{ fontWeight: 'bold' }}
          subtitle={subtitle}
          actAsExpander
          showExpandableButton
        />
        <CardText expandable style={{ padding: 0 }}>
          <textarea
            name={OnlineEditorPythonView.getInputName(field)}
            value={value}
            style={{ display: 'none' }}
            readOnly="true"
          />
          <AceEditor
            mode="python"
            theme="monokai"
            width="100%"
            minLines={10}
            maxLines={Math.max(20, value.split(/\r\n|\r|\n/).length)}
            name={OnlineEditorPythonView.getInputName(field)}
            value={value}
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
          {
            this.renderEditorCard(
              intl.formatMessage(translations.solutionTitle),
              intl.formatMessage(translations.solutionSubtitle),
              'solution'
            )
          }
          {
            this.renderEditorCard(
              intl.formatMessage(translations.prependTitle),
              intl.formatMessage(translations.prependSubtitle),
              'prepend'
            )
          }
          {
            this.renderEditorCard(
              intl.formatMessage(translations.appendTitle),
              intl.formatMessage(translations.appendSubtitle),
              'append'
            )
          }
        </div>
        <h3>{ intl.formatMessage(translations.dataFilesHeader) }</h3>
        { this.renderExistingDataFiles() }
        { this.renderNewDataFiles() }
        <h3>{ intl.formatMessage(translations.testCasesHeader) }</h3>
        <div style={{ marginBottom: '0.5em' }}>
          <FormattedMessage
            id="course.assessment.question.programming.onlineEditorPythonView.testCasesDescription"
            defaultMessage={
              '{note}: The expression in the {expression} column will be compared with the ' +
              'expression in the {expected} column using the equality operator. The return value ' +
              'of {print} is {none} and the printed output should not be confused with the ' +
              'return value.'
            }
            values={{
              note: <b>{intl.formatMessage(translations.testCaseDescriptionNote)}</b>,
              expression: <b>{intl.formatMessage(translations.expressionHeader)}</b>,
              expected: <b>{intl.formatMessage(translations.expectedHeader)}</b>,
              print: <code>{intl.formatMessage(translations.testCaseDescriptionPrint)}</code>,
              none: <code>{intl.formatMessage(translations.testCaseDescriptionNone)}</code>,
            }}
          />
        </div>
        { errorTextElement }
        {
          this.renderTestCases(intl.formatMessage(translations.publicTestCases),
          testCases, 'public')
        }
        {
          this.renderTestCases(intl.formatMessage(translations.privateTestCases),
          testCases, 'private')
        }
        {
          this.renderTestCases(intl.formatMessage(translations.evaluationTestCases),
          testCases, 'evaluation')
        }
      </div>
    );
  }

  render() {
    const { intl, autograded } = this.props;

    return (
      <div id="python-online-editor">
        {
          this.renderEditorCard(
            intl.formatMessage(translations.submissionTitle),
            null,
            'submission'
          )
        }
        { autograded ? this.renderAutogradedFields() : null }
      </div>
    );
  }
}

OnlineEditorPythonView.propTypes = propTypes;
OnlineEditorPythonView.contextTypes = contextTypes;

export default injectIntl(OnlineEditorPythonView);
