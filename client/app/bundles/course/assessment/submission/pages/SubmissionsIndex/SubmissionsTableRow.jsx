import { memo, useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import moment from 'lib/moment';
import { Chip, Icon, IconButton, TableCell, TableRow } from '@mui/material';
import { useTheme } from '@mui/material/styles';
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
import UnsubmitButton from '../../../../survey/containers/UnsubmitButton';

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
          id={`delete-button-${submission.courseUser.id}`}
          disabled={disabled}
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
            icon={renderUnpublishedWarning(submission)}
            label={
              <a
                href={getEditSubmissionURL(
                  courseId,
                  assessmentId,
                  submission.id,
                )}
              >
                {msg}
              </a>
            }
            style={{
              ...(submission.workflowState !== workflowStates.Graded &&
                styles.chip),
              backgroundColor:
                palette.submissionStatus[submission.workflowState],
              textColor: 'white',
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
      <>
        <UnsubmitButton
          buttonId={submission.courseUser.id} 
          color={palette.submissionIcon.unsubmit}
          setState={setState}
          state={state}
          isUnsubmitting={disabled}
        />
      </>
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

  const renderUser = () => {
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
