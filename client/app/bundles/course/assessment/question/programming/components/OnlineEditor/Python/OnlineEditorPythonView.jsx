import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage, intlShape } from 'react-intl';

import 'brace/mode/python';
import 'brace/theme/monokai';

import translations from '../OnlineEditorView.intl';
import EditorCard from '../EditorCard';
import TestCaseEditor from '../TestCaseEditor';
import PackageFileManager from '../PackageFileManager';

const propTypes = {
  isLoading: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
};

const contextTypes = {
  muiTheme: PropTypes.object.isRequired,
};

class OnlineEditorPythonView extends React.Component {
  render() {
    const { intl } = this.props;

    return (
      <>
        <div style={{ marginBottom: '1em' }}>
          <EditorCard
            mode="python"
            header={intl.formatMessage(translations.submissionTitle)}
            field="question_programming[submission]"
          />
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
        <PackageFileManager />
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
