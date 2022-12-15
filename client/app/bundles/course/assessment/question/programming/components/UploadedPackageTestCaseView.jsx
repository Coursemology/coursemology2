import { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import {
  Card,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import PropTypes from 'prop-types';

import ExpandableText from 'lib/components/core/ExpandableText';

import styles from './UploadedPackageTestCaseView.scss';

const propTypes = {
  testCases: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
};

const translations = defineMessages({
  publicTestCases: {
    id: 'course.assessment.question.programming.UploadedPackageTestCaseView.publicTestCases',
    defaultMessage: 'Public Test Cases',
    description: 'Title for public test cases panel.',
  },
  privateTestCases: {
    id: 'course.assessment.question.programming.UploadedPackageTestCaseView.privateTestCases',
    defaultMessage: 'Private Test Cases',
    description: 'Title for private test cases panel.',
  },
  evaluationTestCases: {
    id: 'course.assessment.question.programming.UploadedPackageTestCaseView.evaluationTestCases',
    defaultMessage: 'Evaluation Test Cases',
    description: 'Title for evaluation test cases panel.',
  },
  identifierHeader: {
    id: 'course.assessment.question.programming.UploadedPackageTestCaseView.identifierHeader',
    defaultMessage: 'Identifier',
    description: 'Header for identifier column of test cases panel.',
  },
  expressionHeader: {
    id: 'course.assessment.question.programming.UploadedPackageTestCaseView.expressionHeader',
    defaultMessage: 'Expression',
    description: 'Header for expression column of test cases panel.',
  },
  expectedHeader: {
    id: 'course.assessment.question.programming.UploadedPackageTestCaseView.expectedHeader',
    defaultMessage: 'Expected',
    description: 'Header for expected column of test cases panel.',
  },
  hintHeader: {
    id: 'course.assessment.question.programming.UploadedPackageTestCaseView.hintHeader',
    defaultMessage: 'Hint',
    description: 'Header for hint column of test cases panel.',
  },
  noTestsMessage: {
    id: 'course.assessment.question.programming.UploadedPackageTestCaseView.noTestsMessage',
    defaultMessage: 'No tests.',
    description: 'Message to be displayed when there are no test cases.',
  },
});

class UploadedPackageTestCaseView extends Component {
  renderTable(tests) {
    if (tests.size > 0) {
      const rows = tests.map((test) => (
        <TableRow
          key={test.get('id')}
          className="question_programming_test_case"
          id={`question_programming_test_case_${test.get('id')}`}
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
