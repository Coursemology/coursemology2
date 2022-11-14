import { Component } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Fade,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
} from '@mui/material';
import { red } from '@mui/material/colors';
import { Map } from 'immutable';
import PropTypes from 'prop-types';

import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-monokai';

import {
  EditorCard,
  ExistingPackageFile,
  NewPackageFile,
  TestCase,
} from '../OnlineEditorBase';
import translations from '../OnlineEditorView.intl';

import styles from '../OnlineEditorView.scss';

const MAX_TEST_CASES = 99;

const propTypes = {
  data: PropTypes.instanceOf(Map).isRequired,
  dataFiles: PropTypes.instanceOf(Map).isRequired,
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
  isCodaveri: PropTypes.bool.isRequired,
  intl: PropTypes.object.isRequired,
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
    const { intl, data, autograded, isCodaveri } = this.props;
    const testCases = data.get('test_cases');
    const testCaseError = data.getIn(['test_cases', 'error']);
    const solutionError = data.get('error_solution');
    const autogradedAndIsCodaveri = autograded && isCodaveri;
    const errorTextElement = testCaseError && (
      <Fade in={!!testCaseError}>
        <div
          style={{
            fontSize: 12,
            lineHeight: '12px',
            color: red[500],
            marginBottom: '1em',
          }}
        >
          {testCaseError}
        </div>
      </Fade>
    );

    return (
      <>
        <div style={{ marginBottom: '1em' }}>
          {this.renderEditorCard(
            intl.formatMessage(translations.solutionTitle),
            autogradedAndIsCodaveri
              ? intl.formatMessage(translations.requiredSolutionSubtitle)
              : intl.formatMessage(translations.solutionSubtitle),
            'solution',
            solutionError,
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
            defaultMessage={
              '{note}: The expression in the {expression} column will be compared with the ' +
              'expression in the {expected} column using the equality operator. The return value ' +
              'of {print} is {none} and the printed output should not be confused with the ' +
              'return value.'
            }
            id="course.assessment.question.programming.OnlineEditorViewitorPythonView.testCasesDescription"
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

  renderEditorCard(header, subtitle, field, error) {
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
          error,
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
      <Accordion
        defaultExpanded
        style={{
          margin: 0,
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          style={{ fontSize: 14, fontWeight: 'bold', margin: 0 }}
        >
          {header}
        </AccordionSummary>
        <AccordionDetails style={{ padding: 0 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className={styles.deleteButtonCell} />
                <TableCell>
                  {this.props.intl.formatMessage(translations.fileNameHeader)}
                </TableCell>
                <TableCell>
                  {this.props.intl.formatMessage(translations.fileSizeHeader)}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.props.data.get('data_files').map(renderDataFile)}
            </TableBody>
          </Table>
        </AccordionDetails>
      </Accordion>
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
      <Accordion
        defaultExpanded
        style={{
          margin: 0,
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          style={{ fontSize: 16, fontWeight: 'bold', margin: 0 }}
        >
          {header}
        </AccordionSummary>
        <AccordionDetails style={{ padding: 0 }}>
          <Table>
            <TableBody>{newPackageFilesRows}</TableBody>
          </Table>
        </AccordionDetails>
      </Accordion>
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
      <Accordion
        defaultExpanded
        style={{
          margin: 0,
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          style={{ fontSize: 16, fontWeight: 'bold', margin: 0 }}
        >
          {header}
        </AccordionSummary>
        <AccordionDetails style={{ padding: 0 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className={styles.deleteButtonCell} />
                <TableCell>{identifier}</TableCell>
                <TableCell>{expression}</TableCell>
                <TableCell>{expected}</TableCell>
                <TableCell>{hint}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>{rows}</TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan="5" style={{ textAlign: 'center' }}>
                  <Button
                    disabled={
                      this.props.isLoading || numAllTestCases >= MAX_TEST_CASES
                    }
                    onClick={this.testCaseCreateHandler(type)}
                    startIcon={<i className="fa fa-plus" />}
                  >
                    {this.props.intl.formatMessage(
                      translations.addNewTestButton,
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </AccordionDetails>
      </Accordion>
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

export default injectIntl(OnlineEditorPythonView);
