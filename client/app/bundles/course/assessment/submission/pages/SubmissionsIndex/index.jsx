import React from 'react';
import { FormattedMessage } from 'react-intl';
import ReactTooltip from 'react-tooltip';

import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import { red100, yellow100, grey100, green100, blue100 } from 'material-ui/styles/colors';

import { workflowStates } from '../../constants';
import translations from '../../translations';

const styles = {
  histogram: {
    borderRadius: 10,
    display: 'flex',
    overflow: 'hidden',
    textAlign: 'center',
  },
  histogramCells: {
    common: { minWidth: 50 },
    unstarted: { backgroundColor: red100 },
    attempting: { backgroundColor: yellow100 },
    submitted: { backgroundColor: grey100 },
    graded: { backgroundColor: blue100 },
    published: { backgroundColor: green100 },
  },
};

class SubmissionsIndex extends React.Component {

  componentWillMount() {
    const mountNode = document.getElementById('course-assessment-submission');
    const dataAttr = mountNode.getAttribute('data');
    const data = JSON.parse(dataAttr);
    this.setState(data);
  }

  renderGrade(grade) {
    const { maximumGrade } = this.state.assessment;
    return `${grade} / ${maximumGrade}`;
  }

  renderStudents() {
    const { submissions, gamified } = this.state;
    return submissions.map(submission => (
      <TableRow key={submission.courseStudent.id}>
        <TableRowColumn>{submission.courseStudent.name}</TableRowColumn>
        <TableRowColumn><FormattedMessage {...translations[submission.workflowState]} /></TableRowColumn>
        <TableRowColumn>{submission.grade ? this.renderGrade(submission.grade) : null}</TableRowColumn>
        {gamified ? <TableRowColumn>{submission.pointsAwarded || null}</TableRowColumn> : null}
      </TableRow>
    ));
  }

  renderHistogram() {
    const { submissions } = this.state;
    const workflowStatesArray = Object.values(workflowStates);

    const submissionStateCounts = submissions.reduce((counts, submission) => ({
      ...counts,
      [submission.workflowState]: counts[submission.workflowState] + 1,
    }), workflowStatesArray.reduce((counts, w) => ({ ...counts, [w]: 0 }), {}));

    return (
      <div style={styles.histogram}>
        {workflowStatesArray.map((w) => {
          const count = submissionStateCounts[w];
          const cellStyle = {
            ...styles.histogramCells.common,
            ...styles.histogramCells[w],
            flex: count,
          };

          return count === 0 ? null : (
            <div key={w} style={cellStyle} data-tip data-for={w}>
              {count}
              <ReactTooltip id={w} effect="solid">
                <FormattedMessage {...translations[w]} />
              </ReactTooltip>
            </div>
          );
        })}
      </div>
    );
  }

  renderHeader() {
    const { title } = this.state.assessment;
    return (
      <Card style={{ marginBottom: 20 }}>
        <CardHeader title={<h3>{title}</h3>} subtitle="Submissions" />
        <CardText>{this.renderHistogram()}</CardText>
      </Card>
    );
  }

  renderTable() {
    const { gamified } = this.state;
    return (
      <Table selectable={false}>
        <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
          <TableRow>
            <TableHeaderColumn>Student Name</TableHeaderColumn>
            <TableHeaderColumn>Submission Status</TableHeaderColumn>
            <TableHeaderColumn>Grade</TableHeaderColumn>
            {gamified ? <TableHeaderColumn>Experience Points</TableHeaderColumn> : null}
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
          {this.renderStudents()}
        </TableBody>
      </Table>
    );
  }

  render() {
    return (
      <div>
        {this.renderHeader()}
        {this.renderTable()}
      </div>
    );
  }
}

export default SubmissionsIndex;
