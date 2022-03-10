import { Component } from 'react';
import ReactTooltip from 'react-tooltip';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { IconButton, Menu, MenuItem } from '@material-ui/core';
import {
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { pink, red } from '@mui/material/colors';
import Delete from '@mui/icons-material/Delete';
import GetApp from '@mui/icons-material/GetApp'; // TODO MUI - Change to download once icons lib is updated
import MoreVert from '@mui/icons-material/MoreVert';
import RemoveCircle from '@mui/icons-material/RemoveCircle';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import { assessmentShape } from '../../propTypes';
import { workflowStates } from '../../constants';
import translations from '../../translations';
import submissionsTranslations from './translations';
import SubmissionsTableRow from './SubmissionsTableRow';

const styles = {
  hideTable: {
    display: 'none',
  },
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

export default class SubmissionsTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      unsubmitAllConfirmation: false,
      deleteAllConfirmation: false,
      anchorEl: null,
    };
  }

  componentDidUpdate() {
    ReactTooltip.rebuild();
  }

  handleClickMenu = (event) => {
    // This prevents ghost click.
    event.preventDefault();

    this.setState({
      anchorEl: event.currentTarget,
    });
  };

  handleCloseMenu = () => {
    this.setState({ anchorEl: null });
  };

  canDownloadStatistics = () => {
    const { submissions } = this.props;
    return (
      submissions.length > 0 &&
      submissions.some((s) => s.workflowState !== workflowStates.Unstarted)
    );
  };

  canDeleteAll() {
    const { submissions } = this.props;
    return submissions.some(
      (s) => s.workflowState !== workflowStates.Unstarted,
    );
  }

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
      <>
        <IconButton
          id="submission-dropdown-icon"
          onClick={this.handleClickMenu}
        >
          <MoreVert />
        </IconButton>
        <Menu
          id="submissions-table-menu"
          anchorEl={this.state.anchorEl}
          disableAutoFocusItem
          onClick={this.handleCloseMenu}
          onClose={this.handleCloseMenu}
          open={Boolean(this.state.anchorEl)}
        >
          <MenuItem
            className={
              downloadFilesAnswerDisabled
                ? 'download-zip-submissions-disabled'
                : 'download-zip-submissions-enabled'
            }
            disabled={downloadFilesAnswerDisabled}
            onClick={
              downloadFilesAnswerDisabled ? null : () => handleDownload('zip')
            }
          >
            {isDownloadingFiles ? <CircularProgress size={30} /> : <GetApp />}
            <FormattedMessage {...submissionsTranslations.downloadZipAnswers} />
          </MenuItem>
          <MenuItem
            className={
              downloadCsvAnswerDisabled
                ? 'download-csv-submissions-disabled'
                : 'download-csv-submissions-enabled'
            }
            disabled={downloadCsvAnswerDisabled}
            onClick={
              downloadCsvAnswerDisabled ? null : () => handleDownload('csv')
            }
          >
            {isDownloadingCsv ? <CircularProgress size={30} /> : <GetApp />}
            <FormattedMessage {...submissionsTranslations.downloadCsvAnswers} />
          </MenuItem>
          <MenuItem
            className={
              downloadStatisticsDisabled
                ? 'download-statistics-disabled'
                : 'download-statistics-enabled'
            }
            disabled={downloadStatisticsDisabled}
            onClick={
              downloadStatisticsDisabled ? null : handleDownloadStatistics
            }
          >
            {isStatisticsDownloading ? (
              <CircularProgress size={30} />
            ) : (
              <GetApp />
            )}
            <FormattedMessage {...submissionsTranslations.downloadStatistics} />
          </MenuItem>
          {assessment.canUnsubmitSubmission ? (
            <MenuItem
              className={
                unsubmitAllDisabled
                  ? 'unsubmit-submissions-disabled'
                  : 'unsubmit-submissions-enabled'
              }
              disabled={unsubmitAllDisabled}
              onClick={() => this.setState({ unsubmitAllConfirmation: true })}
            >
              {isUnsubmitting ? (
                <CircularProgress size={30} />
              ) : (
                <RemoveCircle htmlColor={pink[600]} />
              )}
              <FormattedMessage
                {...submissionsTranslations.unsubmitAllSubmissions}
              />
            </MenuItem>
          ) : null}
          {assessment.canDeleteAllSubmissions ? (
            <MenuItem
              className={
                deleteAllDisabled
                  ? 'delete-submissions-disabled'
                  : 'delete-submissions-enabled'
              }
              disabled={deleteAllDisabled}
              onClick={() => this.setState({ deleteAllConfirmation: true })}
            >
              {isDeleting ? (
                <CircularProgress size={30} />
              ) : (
                <Delete htmlColor={red[900]} />
              )}
              <FormattedMessage
                {...submissionsTranslations.deleteAllSubmissions}
              />
            </MenuItem>
          ) : null}
        </Menu>
      </>
    );
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

  render() {
    const { assessment, isActive } = this.props;

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
        <Table style={{ ...(isActive ? {} : styles.hideTable) }}>
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
  isActive: PropTypes.bool,
};
