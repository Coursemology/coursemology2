import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage, intlShape, defineMessages } from 'react-intl';

import 'brace/mode/c_cpp';
import 'brace/theme/monokai';

import translations from './OnlineEditorView.intl';
import EditorCard from './EditorCard';
import TestCaseEditor from './TestCaseEditor';
import PackageFileManager from './PackageFileManager';

const propTypes = {
  isLoading: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
};

const contextTypes = {
  muiTheme: PropTypes.object.isRequired,
};

const cppTranslations = defineMessages({
  appendSubtitle: {
    id: 'course.assessment.question.programming.CPPEditor.appendSubtitle',
    defaultMessage: 'For any function/variable declarations',
    description: 'Subtitle for append code block.',
  },
});

class CPPEditor extends React.Component {
  render() {
    const { intl } = this.props;

    return (
      <React.Fragment>
        <div style={{ marginBottom: '1em' }}>
          <EditorCard
            mode="c_cpp"
            header={intl.formatMessage(translations.submissionTitle)}
            field="submission"
          />
          <EditorCard
            mode="c_cpp"
            header={intl.formatMessage(translations.solutionTitle)}
            subtitle={intl.formatMessage(translations.solutionSubtitle)}
            field="solution"
          />
          <EditorCard
            mode="c_cpp"
            header={intl.formatMessage(translations.prependTitle)}
            subtitle={intl.formatMessage(translations.prependSubtitle)}
            field="prepend"
          />
          <EditorCard
            mode="c_cpp"
            header={intl.formatMessage(translations.appendTitle)}
            subtitle={intl.formatMessage(cppTranslations.appendSubtitle)}
            field="append"
          />
        </div>
        <PackageFileManager />
        <h3>{ intl.formatMessage(translations.testCasesHeader) }</h3>
        <div style={{ marginBottom: '0.5em' }}>
          <FormattedMessage
            id="course.assessment.question.programming.CPPEditor.testCasesDescription"
            defaultMessage={
              '{note}: The expression in the {expression} column will be compared with the ' +
              'expression in the {expected} column using {expect_star} assertions from the ' +
              '{googletest}. Floating point numbers are formatted with {tostring}.'
            }
            values={{
              note: <b>{intl.formatMessage(translations.testCaseDescriptionNote)}</b>,
              expression: <b>{intl.formatMessage(translations.expressionHeader)}</b>,
              expected: <b>{intl.formatMessage(translations.expectedHeader)}</b>,
              expect_star: <code>EXPECT_*</code>,
              googletest: (
                <a href="https://github.com/google/googletest">
                  {intl.formatMessage(translations.testCaseDescriptionGoogleTest)}
                </a>
              ),
              tostring: (
                <code>
                  <a href="http://en.cppreference.com/w/cpp/string/basic_string/to_string">std::to_string</a>
                </code>
              ),
            }}
          />
        </div>
        <TestCaseEditor isLoading={false} />
      </React.Fragment>
    );
  }
}

CPPEditor.propTypes = propTypes;
CPPEditor.contextTypes = contextTypes;

export default injectIntl(CPPEditor);
