import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage, intlShape } from 'react-intl';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import {
  Table, TableBody, TableHeader, TableHeaderColumn, TableRow,
} from 'material-ui/Table';

import 'brace/mode/python';
import 'brace/theme/monokai';

import styles from '../OnlineEditorView.scss';
import translations from '../OnlineEditorView.intl';
import { ExistingPackageFile, NewPackageFile, EditorCard } from '../OnlineEditorBase';
import TestCaseEditor from '../TestCaseEditor';

const propTypes = {
  isLoading: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
};

const contextTypes = {
  muiTheme: PropTypes.object.isRequired,
};

class OnlineEditorPythonView extends React.Component {
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
            deleteExistingPackageFile: this.props.actions.deleteExistingPackageFile,
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
    const newPackageFilesRows = this.props.dataFiles.get('new').map(renderNewFile);

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
              { newPackageFilesRows }
            </TableBody>
          </Table>
        </CardText>
      </Card>
    );
  }

  render() {
    const { intl } = this.props;

    return (
      <>
        <div style={{ marginBottom: '1em' }}>
          <EditorCard
            mode="python"
            header={intl.formatMessage(translations.solutionTitle)}
            subtitle={intl.formatMessage(translations.solutionSubtitle)}
            field="question_programming[solution]"
          />
          <EditorCard
            mode="python"
            header={intl.formatMessage(translations.prependTitle)}
            subtitle={intl.formatMessage(translations.prependSubtitle)}
            field="question_programming[prepend]"
          />
          <EditorCard
            mode="python"
            header={intl.formatMessage(translations.appendTitle)}
            subtitle={intl.formatMessage(translations.appendSubtitle)}
            field="question_programming[append]"
          />
        </div>
        <h3>{ intl.formatMessage(translations.dataFilesHeader) }</h3>
        {/* {
          this.renderExistingPackageFiles(
            'data_files',
            this.props.intl.formatMessage(translations.currentDataFilesHeader)
          )
        }
        {
          this.renderNewPackageFiles(
            'data_files',
            this.props.intl.formatMessage(translations.newDataFilesHeader),
            intl.formatMessage(translations.addDataFileButton)
          )
        } */}
        <h3>{ intl.formatMessage(translations.testCasesHeader) }</h3>
        <div style={{ marginBottom: '0.5em' }}>
          <FormattedMessage
            id="course.assessment.question.programming.OnlineEditorViewitorPythonView.testCasesDescription"
            defaultMessage={
              '{note}: The expression in the {expression} column will be compared with the '
              + 'expression in the {expected} column using the equality operator. The return value '
              + 'of {print} is {none} and the printed output should not be confused with the '
              + 'return value.'
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
        <TestCaseEditor isLoading={false} />
      </>
    );
  }
}

OnlineEditorPythonView.propTypes = propTypes;
OnlineEditorPythonView.contextTypes = contextTypes;

export default injectIntl(OnlineEditorPythonView);
