import React, { Component } from 'react';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import { Table, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';
import { red100, yellow100, grey100, green100, blue100 } from 'material-ui/styles/colors';
import WarningIcon from 'material-ui/svg-icons/alert/warning';

import { formatDateTime } from '../utils';
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

  renderTimes() {
    const { submittedAt } = this.props.submission;
    return (
      <Table selectable={false} style={styles.table}>
        <TableBody displayRowCheckbox={false}>
          <TableRow>
            <TableRowColumn>Submitted At</TableRowColumn>
            <TableRowColumn>{formatDateTime(submittedAt)}</TableRowColumn>
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
        />
        <CardText>{late ? ProgressPanel.renderLateWarning() : null}</CardText>
        <CardText>{this.renderTimes()}</CardText>
      </Card>
    );
  }
}

ProgressPanel.propTypes = {
  submission: SubmissionProp.isRequired,
};

export default ProgressPanel;
