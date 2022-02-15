import React from 'react';
import ReactTooltip from 'react-tooltip';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import {
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@material-ui/core';
import { pink, red } from '@material-ui/core/colors';
import Delete from '@material-ui/icons/Delete';
import GetApp from '@material-ui/icons/GetApp'; // TODO MUI - Change to download once icons lib is updated
import MoreVert from '@material-ui/icons/MoreVert';
import RemoveCircle from '@material-ui/icons/RemoveCircle';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import { assessmentShape } from '../../propTypes';
import { workflowStates } from '../../constants';
import translations from '../../translations';
import submissionsTranslations from './translations';
import SubmissionsTableRow from './SubmissionsTableRow';

const styles = {
  unstartedText: {
    color: red[600],
    fontWeight: 'bold',
  },
  tableCell: {
    padding: '0.5em',
    textOverflow: 'initial',
    whiteSpace: 'normal',
    wordBreak: 'break-word',
    alignItems: 'center',
  },
  tableCenterCell: {
    textAlign: 'center',
  },
};

export default class SubmissionsTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      unsubmitAllConfirmation: false,
      deleteAllConfirmation: false,
    };
  }

  componentDidUpdate() {
    ReactTooltip.rebuild();
  }

  canDownloadStatistics = () => {
    const { submissions } = this.props;
    return (
      submissions.length > 0 &&
      submissions.some((s) => s.workflowState !== workflowStates.Unstarted)
    );
  };

  canDownloadAnswers(downloadFormat) {
    const { assessment, submissions } = this.props;
    const downloadable =
      downloadFormat === 'files'
        ? assessment.filesDownloadable
        : assessment.csvDownloadable;
    return (
      downloadable &&
      submissions.some(
        (s) =>
          s.workflowState !== workflowStates.Unstarted &&
          s.workflowState !== workflowStates.Attempting,
      )
    );
  }

  canUnsubmitAll() {
    const { submissions } = this.props;
    return submissions.some(
      (s) =>
        s.workflowState !== workflowStates.Unstarted &&
        s.workflowState !== workflowStates.Attempting,
    );
  }

  canDeleteAll() {
    const { submissions } = this.props;
    return submissions.some(
      (s) => s.workflowState !== workflowStates.Unstarted,
    );
  }

  renderRowUsers() {
    const {
      dispatch,
      courseId,
      assessmentId,
      submissions,
      assessment,
      isDownloadingFiles,
      isDownloadingCsv,
      isStatisticsDownloading,
      isUnsubmitting,
      isDeleting,
    } = this.props;

    const props = {
      dispatch,
      courseId,
      assessmentId,
      assessment,
      isDownloadingFiles,
      isDownloadingCsv,
      isStatisticsDownloading,
      isUnsubmitting,
      isDeleting,
    };

    return submissions.map((submission) => (
      <SubmissionsTableRow
        key={submission.courseUser.id}
        submission={submission}
        {...props}
      />
    ));
  }

  renderRowTooltips = () => {
    const tooltipIds = [
      'phantom-user',
      'unpublished-grades',
      'access-logs',
      'unsubmit-button',
      'delete-button',
    ];
    const formattedMessages = [
      submissionsTranslations.phantom,
      submissionsTranslations.publishNotice,
      submissionsTranslations.accessLogs,
      submissionsTranslations.unsubmitSubmission,
      submissionsTranslations.deleteSubmission,
    ];
    return tooltipIds.map((tooltipId, index) => (
      <ReactTooltip key={tooltipId} id={tooltipId} effect="solid">
        <FormattedMessage {...formattedMessages[index]} />
      </ReactTooltip>
    ));
  };

  renderUnsubmitAllConfirmation() {
    const { handleUnsubmitAll, confirmDialogValue } = this.props;
    const { unsubmitAllConfirmation } = this.state;
    return (
      <ConfirmationDialog
        open={unsubmitAllConfirmation}
        onCancel={() => this.setState({ unsubmitAllConfirmation: false })}
        onConfirm={() => {
          this.setState({ unsubmitAllConfirmation: false });
          handleUnsubmitAll();
        }}
        message={
          <FormattedMessage
            {...translations.unsubmitAllConfirmation}
            values={{ users: confirmDialogValue }}
          />
        }
      />
    );
  }

  renderDeleteAllConfirmation() {
    const { handleDeleteAll, confirmDialogValue } = this.props;
    const { deleteAllConfirmation } = this.state;
    return (
      <ConfirmationDialog
        open={deleteAllConfirmation}
        onCancel={() => this.setState({ deleteAllConfirmation: false })}
        onConfirm={() => {
          this.setState({ deleteAllConfirmation: false });
          handleDeleteAll();
        }}
        message={
          <FormattedMessage
            {...translations.deleteAllConfirmation}
            values={{ users: confirmDialogValue }}
          />
        }
      />
    );
  }

  renderDownloadDropdown() {
    const {
      assessment,
      handleDownload,
      handleDownloadStatistics,
      isDownloadingFiles,
      isDownloadingCsv,
      isStatisticsDownloading,
      isUnsubmitting,
      isDeleting,
    } = this.props;
    const disabled =
      isDownloadingFiles ||
      isDownloadingCsv ||
      isStatisticsDownloading ||
      isUnsubmitting ||
      isDeleting;
    const downloadFilesAnswerDisabled =
      disabled || !this.canDownloadAnswers('files');
    const downloadCsvAnswerDisabled =
      disabled || !this.canDownloadAnswers('csv');
    const downloadStatisticsDisabled =
      disabled || !this.canDownloadStatistics();
    const unsubmitAllDisabled = disabled || !this.canUnsubmitAll();
    const deleteAllDisabled = disabled || !this.canDeleteAll();
    return (
      <IconMenu
        iconButtonElement={
          <IconButton id="submission-dropdown-icon">
            <MoreVert />
          </IconButton>
        }
      >
        <MenuItem
          className={
            downloadFilesAnswerDisabled
              ? 'download-zip-submissions-disabled'
              : 'download-zip-submissions-enabled'
          }
          primaryText={
            <FormattedMessage {...submissionsTranslations.downloadZipAnswers} />
          }
          disabled={downloadFilesAnswerDisabled}
          leftIcon={
            isDownloadingFiles ? <CircularProgress size={30} /> : <GetApp />
          }
          onClick={
            downloadFilesAnswerDisabled ? null : () => handleDownload('zip')
          }
        />
        <MenuItem
          className={
            downloadCsvAnswerDisabled
              ? 'download-csv-submissions-disabled'
              : 'download-csv-submissions-enabled'
          }
          primaryText={
            <FormattedMessage {...submissionsTranslations.downloadCsvAnswers} />
          }
          disabled={downloadCsvAnswerDisabled}
          leftIcon={
            isDownloadingCsv ? <CircularProgress size={30} /> : <GetApp />
          }
          onClick={
            downloadCsvAnswerDisabled ? null : () => handleDownload('csv')
          }
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
              <GetApp />
            )
          }
          onClick={downloadStatisticsDisabled ? null : handleDownloadStatistics}
        />
        {assessment.canUnsubmitSubmission ? (
          <MenuItem
            className={
              unsubmitAllDisabled
                ? 'unsubmit-submissions-disabled'
                : 'unsubmit-submissions-enabled'
            }
            primaryText={
              <FormattedMessage
                {...submissionsTranslations.unsubmitAllSubmissions}
              />
            }
            disabled={unsubmitAllDisabled}
            leftIcon={
              isUnsubmitting ? (
                <CircularProgress size={30} />
              ) : (
                <RemoveCircle nativeColor={pink[600]} />
              )
            }
            onClick={() => this.setState({ unsubmitAllConfirmation: true })}
          />
        ) : null}
        {assessment.canDeleteAllSubmissions ? (
          <MenuItem
            className={
              deleteAllDisabled
                ? 'delete-submissions-disabled'
                : 'delete-submissions-enabled'
            }
            primaryText={
              <FormattedMessage
                {...submissionsTranslations.deleteAllSubmissions}
              />
            }
            disabled={deleteAllDisabled}
            leftIcon={
              isDeleting ? (
                <CircularProgress size={30} />
              ) : (
                <Delete nativeColor={red[900]} />
              )
            }
            onClick={() => this.setState({ deleteAllConfirmation: true })}
          />
        ) : null}
      </IconMenu>
    );
  }

  render() {
    const { assessment } = this.props;

    const tableHeaderColumnFor = (field) => (
      <TableCell style={styles.tableCell}>
        <FormattedMessage {...submissionsTranslations[field]} />
      </TableCell>
    );

    const tableHeaderCenterColumnFor = (field) => (
      <TableCell style={{ ...styles.tableCell, ...styles.tableCenterCell }}>
        <FormattedMessage {...submissionsTranslations[field]} />
      </TableCell>
    );

    return (
      <>
        <Table>
          <TableHead>
            <TableRow>
              {tableHeaderColumnFor('userName')}
              {tableHeaderCenterColumnFor('submissionStatus')}
              {tableHeaderCenterColumnFor('grade')}
              {assessment.gamified
                ? tableHeaderCenterColumnFor('experiencePoints')
                : null}
              {tableHeaderCenterColumnFor('dateSubmitted')}
              {tableHeaderCenterColumnFor('dateGraded')}
              <TableCell
                style={{ ...styles.tableCell, ...styles.tableCenterCell }}
              >
                {this.renderDownloadDropdown()}
                {this.renderUnsubmitAllConfirmation()}
                {this.renderDeleteAllConfirmation()}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{this.renderRowUsers()}</TableBody>
        </Table>
        {this.renderRowTooltips()}
      </>
    );
  }
}

SubmissionsTable.propTypes = {
  dispatch: PropTypes.func.isRequired,
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
  isDownloadingFiles: PropTypes.bool.isRequired,
  isDownloadingCsv: PropTypes.bool.isRequired,
  isStatisticsDownloading: PropTypes.bool.isRequired,
  isUnsubmitting: PropTypes.bool.isRequired,
  isDeleting: PropTypes.bool.isRequired,
  handleDownload: PropTypes.func,
  handleDownloadStatistics: PropTypes.func,
  handleUnsubmitAll: PropTypes.func,
  handleDeleteAll: PropTypes.func,
  confirmDialogValue: PropTypes.string,
};
