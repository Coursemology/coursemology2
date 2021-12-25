import React from 'react';
import { FormattedMessage } from 'react-intl';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import { blue600, pink600, red600, red900 } from 'material-ui/styles/colors';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import HistoryIcon from 'material-ui/svg-icons/action/history';
import RemoveCircle from 'material-ui/svg-icons/content/remove-circle';
import { TableRow, TableRowColumn } from 'material-ui/Table';
import PropTypes from 'prop-types';

import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import {
  getCourseUserURL,
  getEditSubmissionURL,
  getSubmissionLogsURL,
} from 'lib/helpers/url-builders';
import moment from 'lib/moment';

import {
  deleteSubmission,
  unsubmitSubmission,
} from '../../actions/submissions';
import { workflowStates } from '../../constants';
import { assessmentShape } from '../../propTypes';
import translations from '../../translations';

import submissionsTranslations from './translations';

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

  static formatGrade(grade) {
    return grade !== null ? grade.toFixed(1) : null;
  }

  static renderPhantomUserIcon = (submission) => {
    if (submission.courseUser.phantom) {
      return (
        <FontIcon
          className="fa fa-user-secret fa-xs"
          data-for="phantom-user"
          data-tip={true}
          style={styles.phantomIcon}
        />
      );
    }
    return null;
  };

  static renderUnpublishedWarning(submission) {
    if (submission.workflowState !== workflowStates.Graded) return null;
    return (
      <span style={{ display: 'inline-block', marginRight: 5 }}>
        <a
          data-for="unpublished-grades"
          data-offset="{'left' : -8}"
          data-tip={true}
        >
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
      this.props.isDownloading !== nextProps.isDownloading ||
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
      isDownloading,
      isStatisticsDownloading,
      isDeleting,
      isUnsubmitting,
    } = this.props;
    return (
      isStatisticsDownloading || isDownloading || isDeleting || isUnsubmitting
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
      <span className="delete-button" data-for="delete-button" data-tip={true}>
        <IconButton
          disabled={disabled}
          id={`delete-button-${submission.courseUser.id}`}
          onClick={() => this.setState({ deleteConfirmation: true })}
        >
          <DeleteIcon color={red900} />
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
        message={
          <FormattedMessage
            {...submissionsTranslations.deleteConfirmation}
            values={{ name: submission.courseUser.name }}
          />
        }
        onCancel={() => this.setState({ deleteConfirmation: false })}
        onConfirm={() => {
          dispatch(deleteSubmission(submission.id, successMessage));
          this.setState({ deleteConfirmation: false });
        }}
        open={deleteConfirmation}
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
      <span
        className="submission-access-logs"
        data-for="access-logs"
        data-tip={true}
      >
        <a href={getSubmissionLogsURL(courseId, assessmentId, submission.id)}>
          <IconButton>
            <HistoryIcon color={submission.logCount > 1 ? red600 : blue600} />
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
      <span
        className="unsubmit-button"
        data-for="unsubmit-button"
        data-tip={true}
      >
        <IconButton
          disabled={disabled}
          id={`unsubmit-button-${submission.courseUser.id}`}
          onClick={() => this.setState({ unsubmitConfirmation: true })}
        >
          <RemoveCircle color={pink600} />
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
        message={
          <FormattedMessage
            {...submissionsTranslations.unsubmitConfirmation}
            values={{ name: submission.courseUser.name }}
          />
        }
        onCancel={() => this.setState({ unsubmitConfirmation: false })}
        onConfirm={() => {
          dispatch(unsubmitSubmission(submission.id, successMessage));
          this.setState({ unsubmitConfirmation: false });
        }}
        open={unsubmitConfirmation}
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
      <TableRow key={submission.courseUser.id} className="submission-row">
        <TableRowColumn style={styles.tableCell}>
          {this.renderPhantomUserIcon(submission)}
          <a
            href={getCourseUserURL(courseId, submission.courseUser.id)}
            style={styles.nameWrapper}
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
          {unsubmitConfirmation && this.renderUnsubmitDialog(submission)}
          {deleteConfirmation && this.renderDeleteDialog(submission)}
        </TableRowColumn>
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
  isDownloading: PropTypes.bool.isRequired,
  isStatisticsDownloading: PropTypes.bool.isRequired,
  isUnsubmitting: PropTypes.bool.isRequired,
  isDeleting: PropTypes.bool.isRequired,
};
