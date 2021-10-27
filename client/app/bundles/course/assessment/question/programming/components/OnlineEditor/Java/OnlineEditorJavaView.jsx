import Immutable from 'immutable';

import { Component } from 'react';
import PropTypes from 'prop-types';
import AceEditor from 'react-ace';
import { injectIntl, FormattedMessage, intlShape } from 'react-intl';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import Toggle from 'material-ui/Toggle';
import {
  Table,
  TableBody,
  TableFooter,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import transitions from 'material-ui/styles/transitions';

import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/theme-monokai';

import styles from '../OnlineEditorView.scss';
import translations from '../OnlineEditorView.intl';
import javaTranslations from './OnlineEditorJavaView.intl';
import {
  ExistingPackageFile,
  NewPackageFile,
  TestCase,
  EditorCard,
} from '../OnlineEditorBase';

const MAX_TEST_CASES = 99;

const propTypes = {
  data: PropTypes.instanceOf(Immutable.Map).isRequired,
  testData: PropTypes.instanceOf(Immutable.Map).isRequired,
  actions: PropTypes.shape({
    toggleSubmitAsFile: PropTypes.func.isRequired,
    updateCodeBlock: PropTypes.func.isRequired,
    createTestCase: PropTypes.func.isRequired,
    updateTestCase: PropTypes.func.isRequired,
    deleteTestCase: PropTypes.func.isRequired,
    updateNewPackageFile: PropTypes.func.isRequired,
    deleteNewPackageFile: PropTypes.func.isRequired,
    deleteExistingPackageFile: PropTypes.func.isRequired,
  }),
  isLoading: PropTypes.bool.isRequired,
  autograded: PropTypes.bool.isRequired,
  hasSubmissions: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
};

const contextTypes = {
  muiTheme: PropTypes.object.isRequired,
};

class OnlineEditorJavaView extends Component {
  static getTestInputName(type, field) {
    return `question_programming[test_cases][${type}][][${field}]`;
  }

  testCaseCreateHandler(type) {
    return (e) => {
      e.preventDefault();

      if (!this.props.isLoading) {
        this.props.actions.createTestCase(type);
      }
    };
  }

  renderAutogradedFields() {
    const { intl, data } = this.props;
    const submitAsFile = this.props.data.get('submit_as_file');
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
      <>
        <div style={{ marginBottom: '1em' }}>
          {submitAsFile ? (
            <div style={{ marginBottom: '20px' }}>
              <h3>
                {this.props.intl.formatMessage(
                  javaTranslations.solutionFilesHeader,
                )}
              </h3>
              {this.renderExistingPackageFiles(
                'solution_files',
                this.props.intl.formatMessage(
                  javaTranslations.currentSolutionFilesHeader,
                ),
              )}
              {this.renderNewPackageFiles(
                'solution_files',
                this.props.intl.formatMessage(
                  javaTranslations.newSolutionFilesHeader,
                ),
                intl.formatMessage(javaTranslations.addSolutionFileButton),
              )}
            </div>
          ) : (
            this.renderEditorCard(
              intl.formatMessage(translations.solutionTitle),
              intl.formatMessage(translations.solutionSubtitle),
              'solution',
            )
          )}
          {this.renderEditorCard(
            intl.formatMessage(translations.prependTitle),
            intl.formatMessage(javaTranslations.prependSubtitle),
            'prepend',
          )}
          {this.renderEditorCard(
            intl.formatMessage(translations.appendTitle),
            intl.formatMessage(javaTranslations.appendSubtitle),
            'append',
          )}
        </div>
        <h3>{intl.formatMessage(translations.dataFilesHeader)}</h3>
        {this.renderExistingPackageFiles(
          'data_files',
          this.props.intl.formatMessage(translations.currentDataFilesHeader),
        )}
        {this.renderNewPackageFiles(
          'data_files',
          this.props.intl.formatMessage(translations.newDataFilesHeader),
          intl.formatMessage(translations.addDataFileButton),
        )}
        <h3>{intl.formatMessage(translations.testCasesHeader)}</h3>
        <div style={{ marginBottom: '0.5em' }}>
          <FormattedMessage
            id="course.assessment.question.programming.onlineEditorJavaView.testCasesDescription"
            defaultMessage={
              '{note}: The expression in the {expression} column will be compared with the ' +
              'expression in the {expected} column using the {expectEquals} method as described ' +
              'in the append.'
            }
            values={{
              note: (
                <b>
                  {intl.formatMessage(translations.testCaseDescriptionNote)}
                </b>
              ),
              expression: (
                <b>{intl.formatMessage(translations.expressionHeader)}</b>
              ),
              expected: (
                <b>{intl.formatMessage(translations.expectedHeader)}</b>
              ),
              expectEquals: (
                <code>{intl.formatMessage(javaTranslations.expectEquals)}</code>
              ),
            }}
          />
        </div>
        <div style={{ marginBottom: '0.5em' }}>
          <FormattedMessage
            id="course.assessment.question.programming.onlineEditorJavaView.testCasesCodeDescription"
            defaultMessage={
              '{editor}: Clicking {code} will toggle a code editor for you to write code into each ' +
              'test case. This allows you to initialize variables and call functions for each test. ' +
              'For example: {codeExample}' +
              '{codeExampleExpression} and {codeExampleExpected} can then be input into {expression} and ' +
              '{expected} respectively.'
            }
            values={{
              expression: (
                <b>{intl.formatMessage(translations.expressionHeader)}</b>
              ),
              expected: (
                <b>{intl.formatMessage(translations.expectedHeader)}</b>
              ),
              code: (
                <b>
                  {intl.formatMessage(javaTranslations.testCaseDescriptionCode)}
                </b>
              ),
              editor: (
                <b>
                  {intl.formatMessage(
                    javaTranslations.testCaseDescriptionEditor,
                  )}
                </b>
              ),
              /* eslint-disable react/jsx-indent */
              codeExample: (
                <pre
                  style={{
                    marginTop: '0.5em',
                    paddingTop: '3px',
                    paddingBottom: '3px',
                  }}
                >
                  <p style={{ marginBottom: 0 }}>
                    {'int array [] = {0,0,0}; // Initialize variables'}
                  </p>
                  <p style={{ marginBottom: 0 }}>
                    addOneToArray(array); // Make function calls
                  </p>
                  <p style={{ marginBottom: 0 }}>
                    int expected [] ={'{'}
                    1,1,1
                    {'}'}; // Make function calls
                  </p>
                  <p style={{ marginBottom: 0 }}>
                    {'setAttribute("expression", "addOneToArray([0,0,0])");'}
                    {' // Override the default expression displayed'}
                  </p>
                </pre>
              ),
              /* eslint-enable react/jsx-indent */
              codeExampleExpected: <code>expected</code>,
              codeExampleExpression: <code>array</code>,
            }}
          />
        </div>
        {errorTextElement}
        {this.renderTestCases(
          intl.formatMessage(translations.publicTestCases),
          testCases,
          'public',
        )}
        {this.renderTestCases(
          intl.formatMessage(translations.privateTestCases),
          testCases,
          'private',
        )}
        {this.renderTestCases(
          intl.formatMessage(translations.evaluationTestCases),
          testCases,
          'evaluation',
        )}
      </>
    );
  }

  renderEditorCard(header, subtitle, field) {
    const value = this.props.data.get(field) || '';
    return (
      <EditorCard
        {...{
          updateCodeBlock: this.props.actions.updateCodeBlock,
          mode: 'java',
          field,
          value,
          header,
          subtitle,
          isLoading: this.props.isLoading,
        }}
      />
    );
  }

  renderExistingPackageFiles(fileType, header) {
    const numFiles = this.props.data.get(fileType).size;
    if (numFiles === 0) {
      return null;
    }

    const renderDataFile = (fileData, index) => {
      const hash = fileData.get('hash');
      const filename = fileData.get('filename');

      return (
        <ExistingPackageFile
          key={hash}
          {...{
            filename,
            fileType,
            filesize: fileData.get('size'),
            toDelete: this.props.testData
              .getIn([fileType, 'to_delete'])
              .has(filename),
            deleteExistingPackageFile:
              this.props.actions.deleteExistingPackageFile,
            isLoading: this.props.isLoading,
            isLast: numFiles === index + 1,
          }}
        />
      );
    };

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
                <TableHeaderColumn>
                  {this.props.intl.formatMessage(translations.fileNameHeader)}
                </TableHeaderColumn>
                <TableHeaderColumn>
                  {this.props.intl.formatMessage(translations.fileSizeHeader)}
                </TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false}>
              {this.props.data.get(fileType).map(renderDataFile)}
            </TableBody>
          </Table>
        </CardText>
      </Card>
    );
  }

  renderNewPackageFiles(fileType, header, buttonLabel) {
    const renderNewFile = (fileData, index) => {
      const key = fileData.get('key');
      return (
        <NewPackageFile
          key={key}
          {...{
            index,
            fileType,
            filename: fileData.get('filename'),
            showDeleteButton:
              this.props.testData.getIn([fileType, 'key']) !== key,
            isLoading: this.props.isLoading,
            updateNewPackageFile: this.props.actions.updateNewPackageFile,
            deleteNewPackageFile: this.props.actions.deleteNewPackageFile,
            buttonLabel,
          }}
        />
      );
    };
    const newPackageFilesRows = this.props.testData
      .getIn([fileType, 'new'])
      .map(renderNewFile);

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
            <TableBody displayRowCheckbox={false}>
              {newPackageFilesRows}
            </TableBody>
          </Table>
        </CardText>
      </Card>
    );
  }

  renderTestCases(header, testCases, type) {
    const allTestCases = this.props.data.get('test_cases');
    const numAllTestCases =
      allTestCases.get('public').size +
      allTestCases.get('private').size +
      allTestCases.get('evaluation').size;

    const identifier = this.props.intl.formatMessage(
      translations.identifierHeader,
    );
    const expression = this.props.intl.formatMessage(
      translations.expressionHeader,
    );
    const expected = this.props.intl.formatMessage(translations.expectedHeader);
    const hint = this.props.intl.formatMessage(translations.hintHeader);

    const rows = [...testCases.get(type).entries()].map(([index, test]) => (
      <TestCase
        key={index}
        {...{
          updateTestCase: this.props.actions.updateTestCase,
          deleteTestCase: this.props.actions.deleteTestCase,
          isLoading: this.props.isLoading,
          type,
          index,
          test,
          expression,
          expected,
          hint,
          enableInlineCodeEditor: true,
          showCodeEditor: test.get('show_code_editor') || false,
          intl: this.props.intl,
        }}
      />
    ));

    const editors = [...testCases.get(type).entries()].map(([index, test]) => {
      const showCodeEditor = test.get('show_code_editor') || false;
      const inlineCode = test.get('inline_code') || '';
      let editorStyle = { display: 'none' };
      if (showCodeEditor) {
        editorStyle = {};
      }
      return (
        <TableRow id={index} style={editorStyle} key={`java-editor-${index}`}>
          <TableRowColumn
            colSpan="6"
            style={{ textAlign: 'center', paddingLeft: 0, paddingRight: 0 }}
          >
            <textarea
              name={OnlineEditorJavaView.getTestInputName(type, 'inline_code')}
              value={test.get('inline_code')}
              style={{ display: 'none' }}
              readOnly="true"
            />
            <AceEditor
              mode="java"
              theme="monokai"
              width="100%"
              minLines={4}
              maxLines={Math.max(20, inlineCode.split(/\r\n|\r|\n/).length)}
              name={OnlineEditorJavaView.getTestInputName(type, 'inline_code')}
              value={test.get('inline_code')}
              onChange={(e) =>
                this.props.actions.updateTestCase(type, index, 'inline_code', e)
              }
              editorProps={{ $blockScrolling: true }}
              setOptions={{ useSoftTabs: true, readOnly: this.props.isLoading }}
            />
          </TableRowColumn>
        </TableRow>
      );
    });

    // To interweave the two arrays
    const testCaseRows = [];
    rows.forEach((val, index) => {
      testCaseRows.push(val);
      testCaseRows.push(editors[index]);
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
                <TableHeaderColumn />
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false}>{testCaseRows}</TableBody>
            <TableFooter adjustForCheckbox={false}>
              <TableRow>
                <TableRowColumn colSpan="6" style={{ textAlign: 'center' }}>
                  <FlatButton
                    label={this.props.intl.formatMessage(
                      translations.addNewTestButton,
                    )}
                    icon={<i className="fa fa-plus" />}
                    disabled={
                      this.props.isLoading || numAllTestCases >= MAX_TEST_CASES
                    }
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

  render() {
    const { intl, autograded, isLoading, hasSubmissions } = this.props;
    const submitAsFile = this.props.data.get('submit_as_file');
    let toggleLabel = intl.formatMessage(javaTranslations.submitAsFileToggle);
    if (hasSubmissions) {
      toggleLabel = intl.formatMessage(
        javaTranslations.submitAsFileToggleDisabled,
      );
    }
    return (
      <div id="java-online-editor">
        {autograded && (
          <div className={styles.submitAsFileToggle}>
            <Toggle
              label={toggleLabel}
              labelPosition="right"
              toggled={submitAsFile}
              onToggle={(e) => {
                if (hasSubmissions) return;
                this.props.actions.toggleSubmitAsFile(e.target.checked);
              }}
              readOnly={hasSubmissions}
              disabled={isLoading}
              style={{ margin: '1em 0', paddingTop: 10 }}
            />
            <input
              hidden
              name="question_programming[submit_as_file]"
              value={submitAsFile}
            />
            <FormattedMessage
              id="course.assessment.question.programming.onlineEditorJavaView.fileSubmissionDescription"
              defaultMessage={
                '{file_submission}: Toggling this option on will allow you to upload java class files to be ' +
                'compiled individually, and allows you to test (individual/multiple) java classes. ' +
                'Toggled off, you will input code as templates, which will be used for you to test ' +
                'java functions. Note that you will need to upload either a submission or solution ' +
                'file at the very least for the compiler to compile the files correctly.'
              }
              values={{
                file_submission: (
                  <b>
                    {intl.formatMessage(
                      javaTranslations.fileSubmissionDescriptionNote,
                    )}
                  </b>
                ),
              }}
            />
          </div>
        )}
        {submitAsFile ? (
          <>
            <h3>
              {this.props.intl.formatMessage(
                javaTranslations.submissionFilesHeader,
              )}
            </h3>
            {this.renderExistingPackageFiles(
              'submission_files',
              this.props.intl.formatMessage(
                javaTranslations.currentSubmissionFilesHeader,
              ),
            )}
            {this.renderNewPackageFiles(
              'submission_files',
              this.props.intl.formatMessage(
                javaTranslations.newSubmissionFilesHeader,
              ),
              intl.formatMessage(javaTranslations.addSubmissionFileButton),
            )}
          </>
        ) : (
          this.renderEditorCard(
            intl.formatMessage(translations.submissionTitle),
            null,
            'submission',
          )
        )}
        {autograded ? this.renderAutogradedFields() : null}
      </div>
    );
  }
}

OnlineEditorJavaView.propTypes = propTypes;
OnlineEditorJavaView.contextTypes = contextTypes;

export default injectIntl(OnlineEditorJavaView);
