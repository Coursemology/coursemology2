import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import {
  Card,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@material-ui/core';
import ExpandableText from 'lib/components/ExpandableText';

import styles from './UploadedPackageTestCaseView.scss';

const propTypes = {
  testCases: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
};

const translations = defineMessages({
  publicTestCases: {
    id: 'course.assessment.question.programming.onlineEditorPythonView.publicTestCases',
    defaultMessage: 'Public Test Cases',
    description: 'Title for public test cases panel.',
  },
  privateTestCases: {
    id: 'course.assessment.question.programming.onlineEditorPythonView.privateTestCases',
    defaultMessage: 'Private Test Cases',
    description: 'Title for private test cases panel.',
  },
  evaluationTestCases: {
    id: 'course.assessment.question.programming.onlineEditorPythonView.evaluationTestCases',
    defaultMessage: 'Evaluation Test Cases',
    description: 'Title for evaluation test cases panel.',
  },
  identifierHeader: {
    id: 'course.assessment.question.programming.onlineEditorPythonView.identifierHeader',
    defaultMessage: 'Identifier',
    description: 'Header for identifier column of test cases panel.',
  },
  expressionHeader: {
    id: 'course.assessment.question.programming.onlineEditorPythonView.expressionHeader',
    defaultMessage: 'Expression',
    description: 'Header for expression column of test cases panel.',
  },
  expectedHeader: {
    id: 'course.assessment.question.programming.onlineEditorPythonView.expectedHeader',
    defaultMessage: 'Expected',
    description: 'Header for expected column of test cases panel.',
  },
  hintHeader: {
    id: 'course.assessment.question.programming.onlineEditorPythonView.hintHeader',
    defaultMessage: 'Hint',
    description: 'Header for hint column of test cases panel.',
  },
  noTestsMessage: {
    id: 'course.assessment.question.programming.onlineEditorPythonView.noTestsMessage',
    defaultMessage: 'No tests.',
    description: 'Message to be displayed when there are no test cases.',
  },
});

class UploadedPackageTestCaseView extends React.Component {
  renderTable(tests) {
    if (tests.size > 0) {
      const rows = tests.map((test) => (
        <TableRow
          className="question_programming_test_case"
          id={`question_programming_test_case_${test.get('id')}`}
          key={test.get('id')}
        >
          <TableCell className={styles.testCaseCell}>
            {test.get('identifier')}
          </TableCell>
          <TableCell className={styles.testCaseCell}>
            <ExpandableText text={test.get('expression')} />
          </TableCell>
          <TableCell className={styles.testCaseCell}>
            <ExpandableText text={test.get('expected')} />
          </TableCell>
          <TableCell className={styles.testCaseCell}>
            {test.get('hint')}
          </TableCell>
        </TableRow>
      ));

      return (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                {this.props.intl.formatMessage(translations.identifierHeader)}
              </TableCell>
              <TableCell>
                {this.props.intl.formatMessage(translations.expressionHeader)}
              </TableCell>
              <TableCell>
                {this.props.intl.formatMessage(translations.expectedHeader)}
              </TableCell>
              <TableCell>
                {this.props.intl.formatMessage(translations.hintHeader)}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{rows}</TableBody>
        </Table>
      );
    }

    return (
      <div style={{ textAlign: 'center', padding: '1em' }}>
        {this.props.intl.formatMessage(translations.noTestsMessage)}
      </div>
    );
  }

  render() {
    const { testCases, intl } = this.props;
    const publicTests = testCases.get('public');
    const privateTests = testCases.get('private');
    const evaluationTests = testCases.get('evaluation');

    return (
      <>
        <Card>
          <CardHeader
            className={styles.testCaseTypeHeader}
            title={intl.formatMessage(translations.publicTestCases)}
          />
          {this.renderTable(publicTests)}
        </Card>
        <Card>
          <CardHeader
            className={styles.testCaseTypeHeader}
            title={intl.formatMessage(translations.privateTestCases)}
          />
          {this.renderTable(privateTests)}
        </Card>
        <Card>
          <CardHeader
            className={styles.testCaseTypeHeader}
            title={intl.formatMessage(translations.evaluationTestCases)}
          />
          {this.renderTable(evaluationTests)}
        </Card>
      </>
    );
  }
}

UploadedPackageTestCaseView.propTypes = propTypes;

export default injectIntl(UploadedPackageTestCaseView);
