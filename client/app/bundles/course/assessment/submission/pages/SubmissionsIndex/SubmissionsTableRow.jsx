import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import ReactTooltip from 'react-tooltip';
import moment from 'lib/moment';
import { TableRowColumn } from 'material-ui/Table';
import FontIcon from 'material-ui/FontIcon';
import { red600, red900, blue600, pink600 } from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';
import HistoryIcon from 'material-ui/svg-icons/action/history';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import RemoveCircle from 'material-ui/svg-icons/content/remove-circle';
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
    backgroundColor: blue600,
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
    color: red600,
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
    fontSize: 8,
  },
};

export default class SubmissionsTableRow extends React.Component {
  static formatDate(date) {
    return date ? moment(date).format('DD MMM HH:mm') : null;
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

  static formatGrade(grade) {
    return grade !== null ? grade.toFixed(1) : null;
  }

  constructor(props) {
    super(props);
    this.state = {
      unsubmitConfirmation: false,
      deleteConfirmation: false,
    };
  }

  static renderPhantomUserIcon(submission) {
    if (submission.courseUser.phantom) {
      return (
        <>
          <FontIcon
            data-tip
            data-for={`phantom-user-${submission.courseUser.id}`}
            className="fa fa-user-secret fa-xs"
            style={styles.phantomIcon}
          />
          <ReactTooltip
            id={`phantom-user-${submission.courseUser.id}`}
            effect="solid"
          >
            <FormattedMessage {...submissionsTranslations.phantom} />
          </ReactTooltip>
        </>
      );
    }
    return null;
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
      isDownloading,
      isStatisticsDownloading,
      isDeleting,
      isUnsubmitting,
    } = this.props;
    return (
      isStatisticsDownloading || isDownloading || isDeleting || isUnsubmitting
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

  renderSubmissionLogsLink(submission) {
    const { assessment, courseId, assessmentId } = this.props;

    if (
      !assessment.passwordProtected ||
      !assessment.canViewLogs ||
      !submission.id
    )
      return null;

    return (
      <span
        className="submission-access-logs"
        data-for={`access-logs-${submission.id}`}
        data-tip
      >
        <a href={getSubmissionLogsURL(courseId, assessmentId, submission.id)}>
          <IconButton>
            <HistoryIcon color={submission.logCount > 1 ? red600 : blue600} />
          </IconButton>
          <ReactTooltip id={`access-logs-${submission.id}`} effect="solid">
            <FormattedMessage {...submissionsTranslations.accessLogs} />
          </ReactTooltip>
        </a>
      </span>
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
      <span
        className="unsubmit-button"
        data-for={`unsubmit-button-${submission.id}`}
        data-tip
      >
        <IconButton
          id={`unsubmit-button-${submission.id}`}
          onClick={() => this.setState({ unsubmitConfirmation: true })}
          disabled={disabled}
        >
          <RemoveCircle color={pink600} />
        </IconButton>
        <ReactTooltip id={`unsubmit-button-${submission.id}`} effect="solid">
          <FormattedMessage {...submissionsTranslations.unsubmitSubmission} />
        </ReactTooltip>
      </span>
    );
  }

  renderUnsubmitDialog(submission) {
    const { unsubmitConfirmation } = this.state;
    const { dispatch } = this.props;

    return (
      <ConfirmationDialog
        open={unsubmitConfirmation}
        onCancel={() => this.setState({ unsubmitConfirmation: false })}
        onConfirm={() => {
          dispatch(unsubmitSubmission(submission.id));
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
      <span
        className="delete-button"
        data-for={`delete-button-${submission.id}`}
        data-tip
      >
        <IconButton
          id={`delete-button-${submission.id}`}
          onClick={() => this.setState({ deleteConfirmation: true })}
          disabled={disabled}
        >
          <DeleteIcon color={red900} />
        </IconButton>
        <ReactTooltip id={`delete-button-${submission.id}`} effect="solid">
          <FormattedMessage {...submissionsTranslations.deleteSubmission} />
        </ReactTooltip>
      </span>
    );
  }

  renderDeleteDialog(submission) {
    const { deleteConfirmation } = this.state;
    const { dispatch } = this.props;

    return (
      <ConfirmationDialog
        open={deleteConfirmation}
        onCancel={() => this.setState({ deleteConfirmation: false })}
        onConfirm={() => {
          dispatch(deleteSubmission(submission.id));
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

  renderUser(submission) {
    const { courseId, assessment } = this.props;
    const tableCenterCellStyle = {
      ...styles.tableCell,
      ...styles.tableCenterCell,
    };
    return (
      <>
        <TableRowColumn style={styles.tableCell}>
          {SubmissionsTableRow.renderPhantomUserIcon(submission)}
          <a
            style={styles.nameWrapper}
            href={getCourseUserURL(courseId, submission.courseUser.id)}
          >
            {submission.courseUser.name}
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
          {SubmissionsTableRow.formatDate(submission.dateSubmitted)}
        </TableRowColumn>
        <TableRowColumn style={tableCenterCellStyle}>
          {SubmissionsTableRow.formatDate(submission.dateGraded)}
        </TableRowColumn>
        <TableRowColumn style={tableCenterCellStyle}>
          {this.renderSubmissionLogsLink(submission)}
          {this.renderUnsubmitButton(submission)}
          {this.renderDeleteButton(submission)}
          {this.renderUnsubmitDialog(submission)}
          {this.renderDeleteDialog(submission)}
        </TableRowColumn>
      </>
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
  isDownloading: PropTypes.bool.isRequired,
  isStatisticsDownloading: PropTypes.bool.isRequired,
  isUnsubmitting: PropTypes.bool.isRequired,
  isDeleting: PropTypes.bool.isRequired,
};
