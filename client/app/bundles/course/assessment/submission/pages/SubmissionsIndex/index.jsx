import React from 'react';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import ReactTooltip from 'react-tooltip';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import CircularProgress from 'material-ui/CircularProgress';
import { red100, red600, yellow100, grey100, green100, blue100 } from 'material-ui/styles/colors';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';

import { fetchSubmissions, publishSubmissions, downloadSubmissions } from '../../actions/submissions';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import { getCourseUserURL, getEditSubmissionURL } from 'lib/helpers/url-builders';
import { assessmentShape } from '../../propTypes';
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
  unstartedText: {
    color: red600,
    fontWeight: 'bold',
  },
};

class VisibleSubmissionsIndex extends React.Component {

  state = {
    publishConfirmation: false,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetchSubmissions());
  }

  canPublish() {
    const { submissions } = this.props;
    return submissions.some(s => s.workflowState === workflowStates.Graded);
  }

  canDownload() {
    const { assessment, submissions } = this.props;
    return assessment.downloadable && submissions.some(s =>
      s.workflowState !== workflowStates.Unstarted &&
      s.workflowState !== workflowStates.Attempting
    );
  }

  renderSubmissionWorkflowState(submission) {
    const { courseId, assessmentId } = this.props.match.params;

    if (submission.workflowState === workflowStates.Unstarted) {
      return (
        <div style={styles.unstartedText}>
          <FormattedMessage {...translations[submission.workflowState]} />
        </div>
      );
    }
    return (
      <a href={getEditSubmissionURL(courseId, assessmentId, submission.id)}>
        <FormattedMessage {...translations[submission.workflowState]} />
      </a>
    );
  }

  renderStudents() {
    const { courseId } = this.props.match.params;
    const { assessment: { maximumGrade, gamified }, submissions } = this.props;
    return submissions.map(submission => (
      <TableRow key={submission.courseStudent.id}>
        <TableRowColumn>
          <a href={getCourseUserURL(courseId, submission.courseStudent.id)}>
            {submission.courseStudent.name}
          </a>
        </TableRowColumn>
        <TableRowColumn>
          {this.renderSubmissionWorkflowState(submission)}
        </TableRowColumn>
        <TableRowColumn>
          {submission.grade !== undefined ? `${submission.grade} / ${maximumGrade}` : null}
        </TableRowColumn>
        {gamified ? <TableRowColumn>
          {submission.pointsAwarded || null}
        </TableRowColumn> : null}
      </TableRow>
    ));
  }

  renderHistogram() {
    const { submissions } = this.props;
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
    const { assessment: { title }, dispatch, isPublishing, isDownloading } = this.props;
    return (
      <Card style={{ marginBottom: 20 }}>
        <CardHeader title={<h3>{title}</h3>} subtitle="Submissions" />
        <CardText>{this.renderHistogram()}</CardText>
        <CardActions>
          <FlatButton
            disabled={isPublishing || !this.canPublish()}
            secondary
            label="Publish All"
            labelPosition="before"
            icon={isPublishing ? <CircularProgress size={24} /> : null}
            onTouchTap={() => this.setState({ publishConfirmation: true })}
          />
          <FlatButton
            disabled={isDownloading || !this.canDownload()}
            primary
            label="Download All"
            labelPosition="before"
            icon={isDownloading ? <CircularProgress size={24} /> : null}
            onTouchTap={() => dispatch(downloadSubmissions())}
          />
        </CardActions>
      </Card>
    );
  }

  renderTable() {
    const { gamified } = this.props.assessment;
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

  renderPublishConfirmation() {
    const { dispatch } = this.props;
    const { publishConfirmation } = this.state;
    return (
      <ConfirmationDialog
        open={publishConfirmation}
        onCancel={() => this.setState({ publishConfirmation: false })}
        onConfirm={() => {
          dispatch(publishSubmissions());
          this.setState({ publishConfirmation: false });
        }}
        message={<FormattedMessage {...translations.publishConfirmation} />}
      />
    );
  }

  render() {
    const { isLoading } = this.props;

    if (isLoading) {
      return <LoadingIndicator />;
    }

    return (
      <div>
        {this.renderHeader()}
        {this.renderTable()}
        {this.renderPublishConfirmation()}
      </div>
    );
  }
}

VisibleSubmissionsIndex.propTypes = {
  dispatch: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      courseId: PropTypes.string,
      assessmentId: PropTypes.string,
      submissionId: PropTypes.string,
    }),
  }),
  assessment: assessmentShape.isRequired,
  submissions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      workflowState: PropTypes.string,
      grade: PropTypes.number,
      pointsAwarded: PropTypes.number,
    })
  ),
  isLoading: PropTypes.bool.isRequired,
  isDownloading: PropTypes.bool.isRequired,
  isPublishing: PropTypes.bool.isRequired,
};

function mapStateToProps(state) {
  return {
    assessment: state.assessment,
    submissions: state.submissions,
    isLoading: state.submissionFlags.isLoading,
    isDownloading: state.submissionFlags.isDownloading,
    isPublishing: state.submissionFlags.isPublishing,
  };
}

const SubmissionsIndex = connect(mapStateToProps)(VisibleSubmissionsIndex);
export default SubmissionsIndex;
