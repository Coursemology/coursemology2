import React, { Component } from 'react';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import { Table, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';
import { red100, yellow100, grey100, green100, blue100 } from 'material-ui/styles/colors';
import WarningIcon from 'material-ui/svg-icons/alert/warning';
// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import moment from 'lib/moment';

import { ProgressProp } from '../propTypes';

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

  /* eslint-disable camelcase */
  renderGrading() {
    const { base_points, grade, graded_at, grader, maximum_grade, points_awarded } = this.props.progress;
    return (
      <Table selectable={false} style={styles.table}>
        <TableBody displayRowCheckbox={false}>
          <TableRow>
            <TableRowColumn>Grade</TableRowColumn>
            <TableRowColumn>{grade} / {maximum_grade}</TableRowColumn>
          </TableRow>
          <TableRow>
            <TableRowColumn>Experience Points</TableRowColumn>
            <TableRowColumn>{points_awarded} / {base_points}</TableRowColumn>
          </TableRow>
          <TableRow>
            <TableRowColumn>Graded At</TableRowColumn>
            <TableRowColumn>{ProgressPanel.formatDateTime(graded_at)}</TableRowColumn>
          </TableRow>
          <TableRow>
            <TableRowColumn>Grader</TableRowColumn>
            <TableRowColumn>{grader}</TableRowColumn>
          </TableRow>
        </TableBody>
      </Table>
    );
  }
  /* eslint-enable camelcase */

  renderTimes() {
    const { attempted_at, due_at, submitted_at } = this.props.progress;
    return (
      <Table selectable={false} style={styles.table}>
        <TableBody displayRowCheckbox={false}>
          <TableRow>
            <TableRowColumn>Attempted At</TableRowColumn>
            <TableRowColumn>{ProgressPanel.formatDateTime(attempted_at)}</TableRowColumn>
          </TableRow>
          <TableRow>
            <TableRowColumn>Submitted At</TableRowColumn>
            <TableRowColumn>{ProgressPanel.formatDateTime(submitted_at)}</TableRowColumn>
          </TableRow>
          <TableRow>
            <TableRowColumn>Due At</TableRowColumn>
            <TableRowColumn>{ProgressPanel.formatDateTime(due_at)}</TableRowColumn>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  render() {
    const { late, submitter, workflow_state } = this.props.progress;
    const title = {
      attempting: 'Attempting',
      submitted: 'Submitted',
      graded: 'Graded but not published',
      published: 'Graded',
    }[workflow_state];
    return (
      <Card>
        <CardHeader
          title={`Submission by ${submitter}`}
          subtitle={title}
          style={styles.header[workflow_state]}
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
  progress: ProgressProp.isRequired,
};

export default ProgressPanel;
