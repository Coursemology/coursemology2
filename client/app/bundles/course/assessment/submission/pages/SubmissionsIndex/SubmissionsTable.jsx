// eslint-disable-next-line import/extensions, import/no-extraneous-dependencies, import/no-unresolved
import { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import ReactTooltip from 'react-tooltip';
import moment from 'lib/moment';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import { red600, blue600 } from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';
import CircularProgress from 'material-ui/CircularProgress';
import DownloadIcon from 'material-ui/svg-icons/file/file-download';
import HistoryIcon from 'material-ui/svg-icons/action/history';

import {
  getCourseUserURL,
  getEditSubmissionURL,
  getSubmissionLogsURL,
} from 'lib/helpers/url-builders';
import { assessmentShape } from '../../propTypes';
import { workflowStates } from '../../constants';
import translations from '../../translations';
import submissionsTranslations from './translations';

const styles = {
  unstartedText: {
    color: red600,
    fontWeight: 'bold',
  },
  tableCell: {
    padding: '0.5em',
    textOverflow: 'initial',
    whiteSpace: 'normal',
    wordBreak: 'break-word',
  },
  tableCenterCell: {
    textAlign: 'center',
  },
};

export default class SubmissionsTable extends Component {
  static formatDate(date) {
    return date ? moment(date).format('DD MMM HH:mm') : null;
  }

  static formatGrade(grade) {
    return grade !== null ? grade.toFixed(1) : null;
  }

  static renderUnpublishedWarning(submission) {
    if (submission.workflowState !== workflowStates.Graded) return null;

    return (
      <span style={{ display: 'inline-block', marginRight: 5 }}>
        <a data-tip data-for="unpublished-grades" data-offset="{'left' : -8}">
          <i className="fa fa-exclamation-triangle" />
        </a>
        <ReactTooltip id="unpublished-grades" effect="solid">
          <FormattedMessage {...submissionsTranslations.publishNotice} />
        </ReactTooltip>
      </span>
    );
  }

  getGradeString(submission) {
    if (submission.workflowState === workflowStates.Unstarted) return null;

    const { assessment } = this.props;

    const gradeString =
      submission.workflowState === workflowStates.Attempting ||
      submission.workflowState === workflowStates.Submitted
        ? '--'
        : SubmissionsTable.formatGrade(submission.grade);

    const maximumGradeString = SubmissionsTable.formatGrade(
      assessment.maximumGrade,
    );

    return `${gradeString} / ${maximumGradeString}`;
  }

  canDownload() {
    const { assessment, submissions } = this.props;
    return (
      assessment.downloadable &&
      submissions.some(
        (s) =>
          s.workflowState !== workflowStates.Unstarted &&
          s.workflowState !== workflowStates.Attempting,
      )
    );
  }

  canDownloadStatistics = () => {
    const { submissions } = this.props;
    return submissions.length > 0;
  };

  renderDownloadDropdown() {
    const {
      handleDownload,
      handleDownloadStatistics,
      isDownloading,
      isStatisticsDownloading,
    } = this.props;
    const downloadAnswerDisabled = isDownloading || !this.canDownload();
    const downloadStatisticsDisabled =
      isStatisticsDownloading || !this.canDownloadStatistics();
    return (
      <IconMenu
        iconButtonElement={
          <IconButton id="download-dropdown-icon">
            <MoreVertIcon />
          </IconButton>
        }
      >
        <MenuItem
          className={
            downloadAnswerDisabled
              ? 'download-submissions-disabled'
              : 'download-submissions-enabled'
          }
          primaryText={
            <FormattedMessage {...submissionsTranslations.downloadAnswers} />
          }
          disabled={downloadAnswerDisabled}
          leftIcon={
            isDownloading ? <CircularProgress size={30} /> : <DownloadIcon />
          }
          onClick={downloadAnswerDisabled ? null : handleDownload}
        />
        <MenuItem
          className={
            downloadStatisticsDisabled
              ? 'download-statistics-disabled'
              : 'download-statistics-enabled'
          }
          primaryText={
            <FormattedMessage {...submissionsTranslations.downloadStatistics} />
          }
          disabled={downloadStatisticsDisabled}
          leftIcon={
            isStatisticsDownloading ? (
              <CircularProgress size={30} />
            ) : (
              <DownloadIcon />
            )
          }
          onClick={downloadStatisticsDisabled ? null : handleDownloadStatistics}
        />
      </IconMenu>
    );
  }

  renderStudents() {
    const { courseId, assessment, submissions } = this.props;

    const tableCenterCellStyle = {
      ...styles.tableCell,
      ...styles.tableCenterCell,
    };

    return submissions.map((submission) => (
      <TableRow className="submission-row" key={submission.courseStudent.id}>
        <TableRowColumn style={styles.tableCell}>
          <a href={getCourseUserURL(courseId, submission.courseStudent.id)}>
            {submission.courseStudent.name}
          </a>
        </TableRowColumn>
        <TableRowColumn style={tableCenterCellStyle}>
          {this.renderSubmissionWorkflowState(submission)}
        </TableRowColumn>
        <TableRowColumn style={tableCenterCellStyle}>
          {this.getGradeString(submission)}
        </TableRowColumn>
        {assessment.gamified ? (
          <TableRowColumn style={tableCenterCellStyle}>
            {submission.pointsAwarded !== undefined
              ? submission.pointsAwarded
              : null}
          </TableRowColumn>
        ) : null}
        <TableRowColumn style={tableCenterCellStyle}>
          {SubmissionsTable.formatDate(submission.dateSubmitted)}
        </TableRowColumn>
        <TableRowColumn style={tableCenterCellStyle}>
          {SubmissionsTable.formatDate(submission.dateGraded)}
        </TableRowColumn>
        <TableRowColumn style={{ width: 48, padding: 12 }}>
          {this.renderSubmissionLogsLink(submission)}
        </TableRowColumn>
      </TableRow>
    ));
  }

  renderSubmissionLogsLink(submission) {
    const { assessment, courseId, assessmentId } = this.props;

    if (
      !assessment.passwordProtected ||
      !assessment.canViewLogs ||
      !submission.id
    )
      return null;

    return (
      <div
        className="submission-access-logs"
        data-for={`access-logs-${submission.id}`}
        data-tip
      >
        <a href={getSubmissionLogsURL(courseId, assessmentId, submission.id)}>
          <HistoryIcon
            style={{ color: submission.logCount > 1 ? red600 : blue600 }}
          />
          <ReactTooltip id={`access-logs-${submission.id}`} effect="solid">
            <FormattedMessage {...submissionsTranslations.accessLogs} />
          </ReactTooltip>
        </a>
      </div>
    );
  }

  renderSubmissionWorkflowState(submission) {
    const { courseId, assessmentId } = this.props;

    if (submission.workflowState === workflowStates.Unstarted) {
      return (
        <div style={styles.unstartedText}>
          <FormattedMessage {...translations[submission.workflowState]} />
        </div>
      );
    }

    return (
      <>
        {SubmissionsTable.renderUnpublishedWarning(submission)}
        <a href={getEditSubmissionURL(courseId, assessmentId, submission.id)}>
          <FormattedMessage {...translations[submission.workflowState]} />
        </a>
      </>
    );
  }

  render() {
    const { submissions, assessment } = this.props;

    const tableHeaderColumnFor = (field) => (
      <TableHeaderColumn style={styles.tableCell}>
        <FormattedMessage {...submissionsTranslations[field]} />
      </TableHeaderColumn>
    );

    const tableHeaderCenterColumnFor = (field) => (
      <TableHeaderColumn
        style={{ ...styles.tableCell, ...styles.tableCenterCell }}
      >
        <FormattedMessage {...submissionsTranslations[field]} />
      </TableHeaderColumn>
    );

    return (
      <Table selectable={false}>
        <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
          <TableRow>
            {tableHeaderColumnFor('studentName')}
            {tableHeaderCenterColumnFor('submissionStatus')}
            {tableHeaderCenterColumnFor('grade')}
            {assessment.gamified
              ? tableHeaderCenterColumnFor('experiencePoints')
              : null}
            {tableHeaderCenterColumnFor('dateSubmitted')}
            {tableHeaderCenterColumnFor('dateGraded')}
            <TableHeaderColumn style={{ width: 48, padding: 0 }}>
              {this.renderDownloadDropdown()}
            </TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
          {this.renderStudents(submissions)}
        </TableBody>
      </Table>
    );
  }
}

SubmissionsTable.propTypes = {
  submissions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      workflowState: PropTypes.string,
      grade: PropTypes.number,
      pointsAwarded: PropTypes.number,
      dateSubmitted: PropTypes.string,
      dateGraded: PropTypes.string,
    }),
  ),
  assessment: assessmentShape.isRequired,
  courseId: PropTypes.string.isRequired,
  assessmentId: PropTypes.string.isRequired,
  isDownloading: PropTypes.bool.isRequired,
  isStatisticsDownloading: PropTypes.bool.isRequired,
  handleDownload: PropTypes.func,
  handleDownloadStatistics: PropTypes.func,
};
