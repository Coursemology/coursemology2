import { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import moment from 'lib/moment';
import { IconButton } from '@material-ui/core';
import { Icon, TableCell, TableRow } from '@mui/material';
import { blue, pink, red } from '@mui/material/colors';
import Delete from '@mui/icons-material/Delete';
import History from '@mui/icons-material/History';
import RemoveCircle from '@mui/icons-material/RemoveCircle';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import {
  getCourseUserURL,
  getEditSubmissionURL,
  getSubmissionLogsURL,
} from 'lib/helpers/url-builders';
import { assessmentShape } from '../../propTypes';
import { workflowStates } from '../../constants';
import translations from '../../translations';
import submissionsTranslations from './translations';
import {
  unsubmitSubmission,
  deleteSubmission,
} from '../../actions/submissions';

const styles = {
  chip: {
    margin: 4,
    backgroundColor: blue[600],
  },
  nameWrapper: {
    display: 'inline',
    flexWrap: 'nowrap',
    alignItems: 'center',
  },
  phantomIcon: {
    fontSize: '14px',
    marginRight: '2px',
  },
  unstartedText: {
    color: red[600],
    fontWeight: 'bold',
  },
  tableCell: {
    padding: '0.5em',
    textOverflow: 'initial',
    whiteSpace: 'normal',
    alignItems: 'center',
  },
  tableCenterCell: {
    textAlign: 'center',
  },
  button: {
    paddingTop: '0.25em',
    paddingBottom: '0.25em',
  },
};

export default class SubmissionsTableRow extends Component {
  static formatDate(date) {
    return date ? moment(date).format('DD MMM HH:mm') : null;
  }

  static formatGrade(grade) {
    return grade !== null ? grade.toFixed(1) : null;
  }

  static renderPhantomUserIcon(submission) {
    if (submission.courseUser.phantom) {
      return (
        <Icon
          className="fa fa-user-secret fa-xs"
          data-for="phantom-user"
          data-tip
          style={styles.phantomIcon}
        />
      );
    }
    return null;
  }

  static renderUnpublishedWarning(submission) {
    if (submission.workflowState !== workflowStates.Graded) return null;
    return (
      <span style={{ display: 'inline-block', marginRight: 5 }}>
        <a data-tip data-for="unpublished-grades" data-offset="{'left' : -8}">
          <i className="fa fa-exclamation-triangle" />
        </a>
      </span>
    );
  }

  constructor(props) {
    super(props);
    this.state = {
      unsubmitConfirmation: false,
      deleteConfirmation: false,
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.props.submission.workflowState !==
        nextProps.submission.workflowState ||
      this.props.isDownloadingFiles !== nextProps.isDownloadingFiles ||
      this.props.isDownloadingCsv !== nextProps.isDownloadingCsv ||
      this.props.isStatisticsDownloading !==
        nextProps.isStatisticsDownloading ||
      this.props.isUnsubmitting !== nextProps.isUnsubmitting ||
      this.props.isDeleting !== nextProps.isDeleting ||
      this.state.unsubmitConfirmation !== nextState.unsubmitConfirmation ||
      this.state.deleteConfirmation !== nextState.deleteConfirmation
    );
  }

  getGradeString(submission) {
    if (submission.workflowState === workflowStates.Unstarted) return null;

    const { assessment } = this.props;
    const gradeString =
      submission.workflowState === workflowStates.Attempting ||
      submission.workflowState === workflowStates.Submitted
        ? '--'
        : SubmissionsTableRow.formatGrade(submission.grade);
    const maximumGradeString = SubmissionsTableRow.formatGrade(
      assessment.maximumGrade,
    );

    return `${gradeString} / ${maximumGradeString}`;
  }

  disableButtons() {
    const {
      isDownloadingFiles,
      isDownloadingCsv,
      isStatisticsDownloading,
      isDeleting,
      isUnsubmitting,
    } = this.props;
    return (
      isStatisticsDownloading ||
      isDownloadingFiles ||
      isDownloadingCsv ||
      isDeleting ||
      isUnsubmitting
    );
  }

  renderDeleteButton(submission) {
    const { assessment } = this.props;
    const disabled =
      this.disableButtons() ||
      submission.workflowState === workflowStates.Unstarted;
    if (
      !assessment.canDeleteAllSubmissions &&
      !submission.courseUser.isCurrentUser
    )
      return null;

    return (
      <span className="delete-button" data-for="delete-button" data-tip>
        <IconButton
          id={`delete-button-${submission.courseUser.id}`}
          disabled={disabled}
          onClick={() => this.setState({ deleteConfirmation: true })}
          style={styles.button}
        >
          <Delete htmlColor={disabled ? undefined : red[900]} />
        </IconButton>
      </span>
    );
  }

  renderDeleteDialog(submission) {
    const { deleteConfirmation } = this.state;
    const { dispatch } = this.props;
    const values = { name: submission.courseUser.name };
    const successMessage = (
      <FormattedMessage
        {...translations.deleteSubmissionSuccess}
        values={values}
      />
    );
    return (
      <ConfirmationDialog
        open={deleteConfirmation}
        onCancel={() => this.setState({ deleteConfirmation: false })}
        onConfirm={() => {
          dispatch(deleteSubmission(submission.id, successMessage));
          this.setState({ deleteConfirmation: false });
        }}
        message={
          <FormattedMessage
            {...submissionsTranslations.deleteConfirmation}
            values={{ name: submission.courseUser.name }}
          />
        }
      />
    );
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
      <span className="submission-access-logs" data-for="access-logs" data-tip>
        <a href={getSubmissionLogsURL(courseId, assessmentId, submission.id)}>
          <IconButton style={styles.button}>
            <History
              htmlColor={submission.logCount > 1 ? red[600] : blue[600]}
            />
          </IconButton>
        </a>
      </span>
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
        {SubmissionsTableRow.renderUnpublishedWarning(submission)}
        <a href={getEditSubmissionURL(courseId, assessmentId, submission.id)}>
          <FormattedMessage {...translations[submission.workflowState]} />
        </a>
      </>
    );
  }

  renderUnsubmitButton(submission) {
    const { assessment } = this.props;

    const disabled =
      this.disableButtons() ||
      submission.workflowState === workflowStates.Unstarted ||
      submission.workflowState === workflowStates.Attempting;

    if (!assessment.canUnsubmitSubmission) return null;

    return (
      <span className="unsubmit-button" data-for="unsubmit-button" data-tip>
        <IconButton
          id={`unsubmit-button-${submission.courseUser.id}`}
          disabled={disabled}
          onClick={() => this.setState({ unsubmitConfirmation: true })}
          style={styles.button}
        >
          <RemoveCircle htmlColor={disabled ? undefined : pink[600]} />
        </IconButton>
      </span>
    );
  }

  renderUnsubmitDialog(submission) {
    const { unsubmitConfirmation } = this.state;
    const { dispatch } = this.props;
    const values = { name: submission.courseUser.name };
    const successMessage = (
      <FormattedMessage
        {...translations.unsubmitSubmissionSuccess}
        values={values}
      />
    );

    return (
      <ConfirmationDialog
        open={unsubmitConfirmation}
        onCancel={() => this.setState({ unsubmitConfirmation: false })}
        onConfirm={() => {
          dispatch(unsubmitSubmission(submission.id, successMessage));
          this.setState({ unsubmitConfirmation: false });
        }}
        message={
          <FormattedMessage
            {...submissionsTranslations.unsubmitConfirmation}
            values={{ name: submission.courseUser.name }}
          />
        }
      />
    );
  }

  renderUser(submission) {
    const { courseId, assessment } = this.props;
    const { unsubmitConfirmation, deleteConfirmation } = this.state;
    const tableCenterCellStyle = {
      ...styles.tableCell,
      ...styles.tableCenterCell,
    };
    return (
      <TableRow className="submission-row" key={submission.courseUser.id}>
        <TableCell style={styles.tableCell}>
          {SubmissionsTableRow.renderPhantomUserIcon(submission)}
          <a
            style={styles.nameWrapper}
            href={getCourseUserURL(courseId, submission.courseUser.id)}
          >
            {submission.courseUser.name}
          </a>
        </TableCell>
        <TableCell style={tableCenterCellStyle}>
          {this.renderSubmissionWorkflowState(submission)}
        </TableCell>
        <TableCell style={tableCenterCellStyle}>
          {this.getGradeString(submission)}
        </TableCell>
        {assessment.gamified ? (
          <TableCell style={tableCenterCellStyle}>
            {submission.pointsAwarded !== undefined
              ? submission.pointsAwarded
              : null}
          </TableCell>
        ) : null}
        <TableCell style={tableCenterCellStyle}>
          {SubmissionsTableRow.formatDate(submission.dateSubmitted)}
        </TableCell>
        <TableCell style={tableCenterCellStyle}>
          {SubmissionsTableRow.formatDate(submission.dateGraded)}
        </TableCell>
        <TableCell style={tableCenterCellStyle}>
          {this.renderSubmissionLogsLink(submission)}
          {this.renderUnsubmitButton(submission)}
          {this.renderDeleteButton(submission)}
          {unsubmitConfirmation && this.renderUnsubmitDialog(submission)}
          {deleteConfirmation && this.renderDeleteDialog(submission)}
        </TableCell>
      </TableRow>
    );
  }

  render() {
    const { submission } = this.props;
    return this.renderUser(submission);
  }
}

SubmissionsTableRow.propTypes = {
  dispatch: PropTypes.func.isRequired,
  submission: PropTypes.shape({
    id: PropTypes.number,
    workflowState: PropTypes.string,
    grade: PropTypes.number,
    pointsAwarded: PropTypes.number,
    dateSubmitted: PropTypes.string,
    dateGraded: PropTypes.string,
  }),
  assessment: assessmentShape.isRequired,
  courseId: PropTypes.string.isRequired,
  assessmentId: PropTypes.string.isRequired,
  isDownloadingFiles: PropTypes.bool.isRequired,
  isDownloadingCsv: PropTypes.bool.isRequired,
  isStatisticsDownloading: PropTypes.bool.isRequired,
  isUnsubmitting: PropTypes.bool.isRequired,
  isDeleting: PropTypes.bool.isRequired,
};
