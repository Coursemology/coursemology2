import Immutable from 'immutable';

import { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage, intlShape } from 'react-intl';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
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

import 'brace/mode/python';
import 'brace/theme/monokai';

import styles from '../OnlineEditorView.scss';
import translations from '../OnlineEditorView.intl';
import {
  ExistingPackageFile,
  NewPackageFile,
  TestCase,
  EditorCard,
} from '../OnlineEditorBase';

const MAX_TEST_CASES = 99;

const propTypes = {
  data: PropTypes.instanceOf(Immutable.Map).isRequired,
  dataFiles: PropTypes.instanceOf(Immutable.Map).isRequired,
  actions: PropTypes.shape({
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
  intl: intlShape.isRequired,
};

const contextTypes = {
  muiTheme: PropTypes.object.isRequired,
};

class OnlineEditorPythonView extends Component {
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
          {this.renderEditorCard(
            intl.formatMessage(translations.solutionTitle),
            intl.formatMessage(translations.solutionSubtitle),
            'solution',
          )}
          {this.renderEditorCard(
            intl.formatMessage(translations.prependTitle),
            intl.formatMessage(translations.prependSubtitle),
            'prepend',
          )}
          {this.renderEditorCard(
            intl.formatMessage(translations.appendTitle),
            intl.formatMessage(translations.appendSubtitle),
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
            id="course.assessment.question.programming.OnlineEditorViewitorPythonView.testCasesDescription"
            defaultMessage={
              '{note}: The expression in the {expression} column will be compared with the ' +
              'expression in the {expected} column using the equality operator. The return value ' +
              'of {print} is {none} and the printed output should not be confused with the ' +
              'return value.'
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
              print: (
                <code>
                  {intl.formatMessage(translations.testCaseDescriptionPrint)}
                </code>
              ),
              none: (
                <code>
                  {intl.formatMessage(translations.testCaseDescriptionNone)}
                </code>
              ),
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
          mode: 'python',
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
            toDelete: this.props.dataFiles.get('to_delete').has(filename),
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
              {this.props.data.get('data_files').map(renderDataFile)}
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
            showDeleteButton: this.props.dataFiles.get('key') !== key,
            isLoading: this.props.isLoading,
            updateNewPackageFile: this.props.actions.updateNewPackageFile,
            deleteNewPackageFile: this.props.actions.deleteNewPackageFile,
            buttonLabel,
          }}
        />
      );
    };
    const newPackageFilesRows = this.props.dataFiles
      .get('new')
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
          enableInlineCodeEditor: false,
          showCodeEditor: test.get('showCodeEditor') || false,
          intl: this.props.intl,
        }}
      />
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
            <TableBody displayRowCheckbox={false}>{rows}</TableBody>
            <TableFooter adjustForCheckbox={false}>
              <TableRow>
                <TableRowColumn colSpan="5" style={{ textAlign: 'center' }}>
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
    const { intl, autograded } = this.props;

    return (
      <div id="python-online-editor">
        {this.renderEditorCard(
          intl.formatMessage(translations.submissionTitle),
          null,
          'submission',
        )}
        {autograded ? this.renderAutogradedFields() : null}
      </div>
    );
  }
}

OnlineEditorPythonView.propTypes = propTypes;
OnlineEditorPythonView.contextTypes = contextTypes;

export default injectIntl(OnlineEditorPythonView);
