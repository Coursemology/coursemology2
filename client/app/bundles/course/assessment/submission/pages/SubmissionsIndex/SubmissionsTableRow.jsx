import { memo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Warning } from '@mui/icons-material';
import Delete from '@mui/icons-material/Delete';
import History from '@mui/icons-material/History';
import RemoveCircle from '@mui/icons-material/RemoveCircle';
import { Chip, IconButton, Link, TableCell, TableRow } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';

import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';
import GhostIcon from 'lib/components/icons/GhostIcon';
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
  nameWrapper: {
    display: 'inline',
    flexWrap: 'nowrap',
    alignItems: 'center',
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

const formatDate = (date) =>
  date ? moment(date).format('DD MMM HH:mm') : null;

const formatGrade = (grade) => (grade !== null ? grade.toFixed(1) : null);

const renderPhantomUserIcon = (submission) => {
  if (submission.courseUser.phantom) {
    return <GhostIcon data-for="phantom-user" data-tip fontSize="small" />;
  }
  return null;
};

const renderUnpublishedWarning = (submission) => {
  if (submission.workflowState !== workflowStates.Graded) return null;
  return (
    <span style={{ display: 'inline-block', paddingLeft: 5 }}>
      <div data-for="unpublished-grades" data-offset="{'left' : -8}" data-tip>
        <Warning fontSize="inherit" />
      </div>
    </span>
  );
};

const SubmissionsTableRow = (props) => {
  const { assessment, assessmentId, courseId, dispatch, submission } = props;
  const palette = useTheme().palette;
  const [state, setState] = useState({
    unsubmitConfirmation: false,
    deleteConfirmation: false,
  });

  const getGradeString = () => {
    if (submission.workflowState === workflowStates.Unstarted) return null;

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

  const renderDeleteButton = () => {
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
          disabled={disabled}
          id={`delete-button-${submission.courseUser.id}`}
          onClick={() => setState({ ...state, deleteConfirmation: true })}
          size="large"
          style={styles.button}
        >
          <Delete
            htmlColor={disabled ? undefined : palette.submissionIcon.delete}
          />
        </IconButton>
      </span>
    );
  };

  const renderDeleteDialog = () => {
    const { deleteConfirmation } = state;
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
        onCancel={() => setState({ ...state, deleteConfirmation: false })}
        onConfirm={() => {
          dispatch(deleteSubmission(submission.id, successMessage));
          setState({ ...state, deleteConfirmation: false });
        }}
        open={deleteConfirmation}
      />
    );
  };

  const renderSubmissionLogsLink = () => {
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
                palette.submissionIcon.history[
                  submission.logCount > 1 ? 'none' : 'default'
                ]
              }
            />
          </IconButton>
        </a>
      </span>
    );
  };

  const renderSubmissionWorkflowState = () =>
    submission.workflowState === workflowStates.Unstarted ? (
      <FormattedMessage {...translations[submission.workflowState]}>
        {(msg) => (
          <Chip
            icon={renderUnpublishedWarning(submission)}
            label={msg}
            style={{
              ...styles.chip,
              backgroundColor:
                palette.submissionStatus[submission.workflowState],
            }}
            variant="filled"
          />
        )}
      </FormattedMessage>
    ) : (
      <FormattedMessage {...translations[submission.workflowState]}>
        {(msg) => (
          <Chip
            clickable
            component={Link}
            href={getEditSubmissionURL(courseId, assessmentId, submission.id)}
            icon={renderUnpublishedWarning(submission)}
            label={msg}
            style={{
              ...(submission.workflowState !== workflowStates.Graded &&
                styles.chip),
              backgroundColor:
                palette.submissionStatus[submission.workflowState],
              textColor: 'white',
              color: palette.links,
            }}
            variant="filled"
          />
        )}
      </FormattedMessage>
    );

  const renderUnsubmitButton = () => {
    const disabled =
      disableButtons() ||
      submission.workflowState === workflowStates.Unstarted ||
      submission.workflowState === workflowStates.Attempting;

    if (!assessment.canUnsubmitSubmission) return null;

    return (
      <span className="unsubmit-button" data-for="unsubmit-button" data-tip>
        <IconButton
          disabled={disabled}
          id={`unsubmit-button-${submission.courseUser.id}`}
          onClick={() => setState({ ...state, unsubmitConfirmation: true })}
          size="large"
          style={styles.button}
        >
          <RemoveCircle
            htmlColor={disabled ? undefined : palette.submissionIcon.unsubmit}
          />
        </IconButton>
      </span>
    );
  };

  const renderUnsubmitDialog = () => {
    const { unsubmitConfirmation } = state;
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
        onCancel={() => setState({ ...state, unsubmitConfirmation: false })}
        onConfirm={() => {
          dispatch(unsubmitSubmission(submission.id, successMessage));
          setState({ ...state, unsubmitConfirmation: false });
        }}
        open={unsubmitConfirmation}
      />
    );
  };

  const renderUser = () => {
    const { unsubmitConfirmation, deleteConfirmation } = state;
    const tableCenterCellStyle = {
      ...styles.tableCell,
      ...styles.tableCenterCell,
    };
    return (
      <TableRow key={submission.courseUser.id} className="submission-row">
        <TableCell style={styles.tableCell}>
          <span className="flex items-center">
            {renderPhantomUserIcon(submission)}
            <a
              href={getCourseUserURL(courseId, submission.courseUser.id)}
              style={styles.nameWrapper}
            >
              {submission.courseUser.name}
            </a>
          </span>
        </TableCell>
        <TableCell style={tableCenterCellStyle}>
          {renderSubmissionWorkflowState()}
        </TableCell>
        <TableCell style={tableCenterCellStyle}>{getGradeString()}</TableCell>
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
                      href={getCourseUserURL(courseId, grader.id)}
                      style={styles.nameWrapper}
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
          {renderSubmissionLogsLink()}
          {renderUnsubmitButton()}
          {renderDeleteButton()}
          {unsubmitConfirmation && renderUnsubmitDialog()}
          {deleteConfirmation && renderDeleteDialog()}
        </TableCell>
      </TableRow>
    );
  };

  return renderUser();
};

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

export default memo(
  SubmissionsTableRow,
  (prevProps, nextProps) =>
    prevProps.submission.workflowState === nextProps.submission.workflowState &&
    prevProps.isDownloadingFiles === nextProps.isDownloadingFiles &&
    prevProps.isDownloadingCsv === nextProps.isDownloadingCsv &&
    prevProps.isStatisticsDownloading === nextProps.isStatisticsDownloading &&
    prevProps.isUnsubmitting === nextProps.isUnsubmitting &&
    prevProps.isDeleting === nextProps.isDeleting,
);
