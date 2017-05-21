import React, { Component } from 'react';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import { Table, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';
import { red100, yellow100, grey100, green100, blue100 } from 'material-ui/styles/colors';
import WarningIcon from 'material-ui/svg-icons/alert/warning';
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import moment from 'lib/moment';

import { SubmissionProp } from '../propTypes';

const styles = {
  header: {
    attempting: {
      backgroundColor: yellow100,
    },
    submitted: {
      backgroundColor: grey100,
    },
    graded: {
      backgroundColor: blue100,
    },
    published: {
      backgroundColor: green100,
    },
  },
  warningIcon: {
    display: 'inline-block',
    verticalAlign: 'middle',
  },
  table: {
    maxWidth: 600,
  },
};

class ProgressPanel extends Component {
  static formatDateTime(dateTime) {
    return dateTime ? moment(dateTime).format('DD MMM YYYY, h:mma') : null;
  }

  static renderLateWarning() {
    return (
      <Card style={{ backgroundColor: red100 }}>
        <CardText>
          <WarningIcon style={styles.warningIcon} />
          <span>This submission is LATE! You may want to penalize the student for late submission.</span>
        </CardText>
      </Card>
    );
  }

  renderGrading() {
    const { basePoints, grade, gradedAt, grader, maximumGrade, pointsAwarded } = this.props.submission;
    return (
      <Table selectable={false} style={styles.table}>
        <TableBody displayRowCheckbox={false}>
          <TableRow>
            <TableRowColumn>Grade</TableRowColumn>
            <TableRowColumn>{grade} / {maximumGrade}</TableRowColumn>
          </TableRow>
          <TableRow>
            <TableRowColumn>Experience Points</TableRowColumn>
            <TableRowColumn>{pointsAwarded} / {basePoints}</TableRowColumn>
          </TableRow>
          <TableRow>
            <TableRowColumn>Graded At</TableRowColumn>
            <TableRowColumn>{ProgressPanel.formatDateTime(gradedAt)}</TableRowColumn>
          </TableRow>
          <TableRow>
            <TableRowColumn>Grader</TableRowColumn>
            <TableRowColumn>{grader}</TableRowColumn>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  renderTimes() {
    const { attemptedAt, dueAt, submittedAt } = this.props.submission;
    return (
      <Table selectable={false} style={styles.table}>
        <TableBody displayRowCheckbox={false}>
          <TableRow>
            <TableRowColumn>Attempted At</TableRowColumn>
            <TableRowColumn>{ProgressPanel.formatDateTime(attemptedAt)}</TableRowColumn>
          </TableRow>
          <TableRow>
            <TableRowColumn>Submitted At</TableRowColumn>
            <TableRowColumn>{ProgressPanel.formatDateTime(submittedAt)}</TableRowColumn>
          </TableRow>
          <TableRow>
            <TableRowColumn>Due At</TableRowColumn>
            <TableRowColumn>{ProgressPanel.formatDateTime(dueAt)}</TableRowColumn>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  render() {
    const { late, submitter, workflowState } = this.props.submission;
    const title = {
      attempting: 'Attempting',
      submitted: 'Submitted',
      graded: 'Graded but not published',
      published: 'Graded',
    }[workflowState];
    return (
      <Card>
        <CardHeader
          title={`Submission by ${submitter}`}
          subtitle={title}
          style={styles.header[workflowState]}
          actAsExpander
          showExpandableButton
        />
        <CardText>
          {this.renderGrading()}
          {late ? ProgressPanel.renderLateWarning() : null}
        </CardText>
        <CardText expandable>
          {this.renderTimes()}
        </CardText>
      </Card>
    );
  }
}

ProgressPanel.propTypes = {
  submission: SubmissionProp.isRequired,
};

export default ProgressPanel;
