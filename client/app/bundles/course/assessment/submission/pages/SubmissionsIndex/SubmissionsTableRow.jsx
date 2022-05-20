import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import moment from 'lib/moment';
import {
  Chip,
  Icon,
  IconButton,
  Link,
  TableCell,
  TableRow,
} from '@mui/material';
import Delete from '@mui/icons-material/Delete';
import History from '@mui/icons-material/History';
import RemoveCircle from '@mui/icons-material/RemoveCircle';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import {
  getCourseUserURL,
  getEditSubmissionURL,
  getSubmissionLogsURL,
} from 'lib/helpers/url-builders';
import { useTheme } from '@emotion/react';
import { assessmentShape } from '../../propTypes';
import { workflowStates } from '../../constants';
import translations from '../../translations';
import submissionsTranslations from './translations';
import {
  unsubmitSubmission,
  deleteSubmission,
} from '../../actions/submissions';

const styles = {
  nameWrapper: {
    display: 'inline',
    flexWrap: 'nowrap',
    alignItems: 'center',
  },
  phantomIcon: {
    fontSize: '14px',
    marginRight: '2px',
  },
  chip: {
    width: 100,
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
    padding: '0.25em 0.4em',
  },
};

const SubmissionsTableRow = React.memo((props) => {
  const palette = useTheme().palette;
  const [state, setState] = useState({
    unsubmitConfirmation: false,
    deleteConfirmation: false,
  });
  const formatDate = (date) =>
    date ? moment(date).format('DD MMM HH:mm') : null;

  const formatGrade = (grade) => (grade !== null ? grade.toFixed(1) : null);

  const renderPhantomUserIcon = (submission) => {
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
  };

  const renderUnpublishedWarning = (submission) => {
    if (submission.workflowState !== workflowStates.Graded) return null;
    return (
      <span style={{ display: 'inline-block', paddingLeft: 5 }}>
        <div data-tip data-for="unpublished-grades" data-offset="{'left' : -8}">
          <i className="fa fa-exclamation-triangle" />
        </div>
      </span>
    );
  };

  const getGradeString = (submission) => {
    if (submission.workflowState === workflowStates.Unstarted) return null;

    const { assessment } = props;
    const gradeString =
      submission.workflowState === workflowStates.Attempting ||
      submission.workflowState === workflowStates.Submitted
        ? '--'
        : formatGrade(submission.grade);
    const maximumGradeString = formatGrade(assessment.maximumGrade);

    return `${gradeString} / ${maximumGradeString}`;
  };

  const disableButtons = () => {
    const {
      isDownloadingFiles,
      isDownloadingCsv,
      isStatisticsDownloading,
      isDeleting,
      isUnsubmitting,
    } = props;
    return (
      isStatisticsDownloading ||
      isDownloadingFiles ||
      isDownloadingCsv ||
      isDeleting ||
      isUnsubmitting
    );
  };

  const renderDeleteButton = (submission) => {
    const { assessment } = props;
    const disabled =
      disableButtons() || submission.workflowState === workflowStates.Unstarted;
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
          onClick={() => setState({ ...state, deleteConfirmation: true })}
          size="large"
          style={styles.button}
        >
          <Delete htmlColor={disabled ? undefined : palette.icon.delete} />
        </IconButton>
      </span>
    );
  };

  const renderDeleteDialog = (submission) => {
    const { deleteConfirmation } = state;
    const { dispatch } = props;
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
        onCancel={() => setState({ ...state, deleteConfirmation: false })}
        onConfirm={() => {
          dispatch(deleteSubmission(submission.id, successMessage));
          setState({ ...state, deleteConfirmation: false });
        }}
        message={
          <FormattedMessage
            {...submissionsTranslations.deleteConfirmation}
            values={{ name: submission.courseUser.name }}
          />
        }
      />
    );
  };

  const renderSubmissionLogsLink = (submission) => {
    const { assessment, courseId, assessmentId } = props;

    if (
      !assessment.passwordProtected ||
      !assessment.canViewLogs ||
      !submission.id
    )
      return null;

    return (
      <span className="submission-access-logs" data-for="access-logs" data-tip>
        <a href={getSubmissionLogsURL(courseId, assessmentId, submission.id)}>
          <IconButton size="large" style={styles.button}>
            <History
              htmlColor={
                palette.icon.history[
                  submission.logCount > 1 ? 'none' : 'default'
                ]
              }
            />
          </IconButton>
        </a>
      </span>
    );
  };

  const renderSubmissionWorkflowState = (submission) => {
    const { courseId, assessmentId } = props;
    return submission.workflowState === workflowStates.Unstarted ? (
      <FormattedMessage {...translations[submission.workflowState]}>
        {(msg) => (
          <Chip
            icon={renderUnpublishedWarning(submission)}
            label={msg}
            style={{
              ...styles.chip,
              backgroundColor: palette.status[submission.workflowState],
            }}
            variant="filled"
          />
        )}
      </FormattedMessage>
    ) : (
      <FormattedMessage {...translations[submission.workflowState]}>
        {(msg) => (
          <Chip
            clickable={submission.workflowState !== workflowStates.Unstarted}
            component={Link}
            href={getEditSubmissionURL(courseId, assessmentId, submission.id)}
            icon={renderUnpublishedWarning(submission)}
            label={msg}
            style={{
              ...(submission.workflowState !== workflowStates.Graded &&
                styles.chip),
              backgroundColor: palette.status[submission.workflowState],
            }}
            variant="filled"
          />
        )}
      </FormattedMessage>
    );
  };

  const renderUnsubmitButton = (submission) => {
    const { assessment } = props;

    const disabled =
      disableButtons() ||
      submission.workflowState === workflowStates.Unstarted ||
      submission.workflowState === workflowStates.Attempting;

    if (!assessment.canUnsubmitSubmission) return null;

    return (
      <span className="unsubmit-button" data-for="unsubmit-button" data-tip>
        <IconButton
          id={`unsubmit-button-${submission.courseUser.id}`}
          disabled={disabled}
          onClick={() => setState({ ...state, unsubmitConfirmation: true })}
          size="large"
          style={styles.button}
        >
          <RemoveCircle
            htmlColor={disabled ? undefined : palette.icon.unsubmit}
          />
        </IconButton>
      </span>
    );
  };

  const renderUnsubmitDialog = (submission) => {
    const { unsubmitConfirmation } = state;
    const { dispatch } = props;
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
        onCancel={() => setState({ ...state, unsubmitConfirmation: false })}
        onConfirm={() => {
          dispatch(unsubmitSubmission(submission.id, successMessage));
          setState({ ...state, unsubmitConfirmation: false });
        }}
        message={
          <FormattedMessage
            {...submissionsTranslations.unsubmitConfirmation}
            values={{ name: submission.courseUser.name }}
          />
        }
      />
    );
  };

  const renderUser = (submission) => {
    const { courseId, assessment } = props;
    const { unsubmitConfirmation, deleteConfirmation } = state;
    const tableCenterCellStyle = {
      ...styles.tableCell,
      ...styles.tableCenterCell,
    };
    return (
      <TableRow className="submission-row" key={submission.courseUser.id}>
        <TableCell style={styles.tableCell}>
          {renderPhantomUserIcon(submission)}
          <a
            style={styles.nameWrapper}
            href={getCourseUserURL(courseId, submission.courseUser.id)}
          >
            {submission.courseUser.name}
          </a>
        </TableCell>
        <TableCell style={tableCenterCellStyle}>
          {renderSubmissionWorkflowState(submission)}
        </TableCell>
        <TableCell style={tableCenterCellStyle}>
          {getGradeString(submission)}
        </TableCell>
        {assessment.gamified ? (
          <TableCell style={tableCenterCellStyle}>
            {submission.pointsAwarded !== undefined
              ? submission.pointsAwarded
              : null}
          </TableCell>
        ) : null}
        <TableCell style={tableCenterCellStyle}>
          {formatDate(submission.dateSubmitted)}
        </TableCell>
        <TableCell style={tableCenterCellStyle}>
          {formatDate(submission.dateGraded)}
        </TableCell>
        <TableCell style={tableCenterCellStyle}>
          {submission.graders && submission.graders.length > 0
            ? submission.graders.map((grader) => (
                <div key={`grader_${grader.id}`}>
                  {!grader.id || grader.id === 0 ? (
                    <div style={styles.nameWrapper}>{grader.name}</div>
                  ) : (
                    <a
                      style={styles.nameWrapper}
                      href={getCourseUserURL(courseId, grader.id)}
                    >
                      {grader.name}
                    </a>
                  )}
                  <br />
                </div>
              ))
            : null}
        </TableCell>
        <TableCell style={tableCenterCellStyle}>
          {renderSubmissionLogsLink(submission)}
          {renderUnsubmitButton(submission)}
          {renderDeleteButton(submission)}
          {unsubmitConfirmation && renderUnsubmitDialog(submission)}
          {deleteConfirmation && renderDeleteDialog(submission)}
        </TableCell>
      </TableRow>
    );
  };

  const { submission } = props;
  return renderUser(submission);
});

SubmissionsTableRow.propTypes = {
  dispatch: PropTypes.func.isRequired,
  submission: PropTypes.shape({
    id: PropTypes.number,
    workflowState: PropTypes.string,
    grade: PropTypes.number,
    pointsAwarded: PropTypes.number,
    dateSubmitted: PropTypes.string,
    dateGraded: PropTypes.string,
    graders: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        id: PropTypes.number,
      }),
    ),
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

SubmissionsTableRow.displayName = 'SubmissionsTableRow';

export default SubmissionsTableRow;
