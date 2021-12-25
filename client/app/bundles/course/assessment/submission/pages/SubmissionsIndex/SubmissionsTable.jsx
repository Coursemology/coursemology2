import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import ReactTooltip from 'react-tooltip';
import CircularProgress from 'material-ui/CircularProgress';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import { pink600, red600, red900 } from 'material-ui/styles/colors';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import RemoveCircle from 'material-ui/svg-icons/content/remove-circle';
import DownloadIcon from 'material-ui/svg-icons/file/file-download';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
} from 'material-ui/Table';
import PropTypes from 'prop-types';

import ConfirmationDialog from 'lib/components/ConfirmationDialog';

import { workflowStates } from '../../constants';
import { assessmentShape } from '../../propTypes';
import translations from '../../translations';

import SubmissionsTableRow from './SubmissionsTableRow';
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
    alignItems: 'center',
  },
  tableCenterCell: {
    textAlign: 'center',
  },
};

export default class SubmissionsTable extends Component {
  static renderRowTooltips = () => {
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
      <ReactTooltip key={tooltipId} effect="solid" id={tooltipId}>
        <FormattedMessage {...formattedMessages[index]} />
      </ReactTooltip>
    ));
  };

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

  canDeleteAll() {
    const { submissions } = this.props;
    return submissions.some(
      (s) => s.workflowState !== workflowStates.Unstarted,
    );
  }

  canDownloadAnswers() {
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
        message={
          <FormattedMessage
            {...translations.deleteAllConfirmation}
            values={{ users: confirmDialogValue }}
          />
        }
        onCancel={() => this.setState({ deleteAllConfirmation: false })}
        onConfirm={() => {
          this.setState({ deleteAllConfirmation: false });
          handleDeleteAll();
        }}
        open={deleteAllConfirmation}
      />
    );
  }

  renderDownloadDropdown() {
    const {
      assessment,
      handleDownload,
      handleDownloadStatistics,
      isDownloading,
      isStatisticsDownloading,
      isUnsubmitting,
      isDeleting,
    } = this.props;
    const disabled =
      isDownloading || isStatisticsDownloading || isUnsubmitting || isDeleting;
    const downloadAnswerDisabled = disabled || !this.canDownloadAnswers();
    const downloadStatisticsDisabled =
      disabled || !this.canDownloadStatistics();
    const unsubmitAllDisabled = disabled || !this.canUnsubmitAll();
    const deleteAllDisabled = disabled || !this.canDeleteAll();
    return (
      <IconMenu
        iconButtonElement={
          <IconButton id="submission-dropdown-icon">
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
          disabled={downloadAnswerDisabled}
          leftIcon={
            isDownloading ? <CircularProgress size={30} /> : <DownloadIcon />
          }
          onClick={downloadAnswerDisabled ? null : handleDownload}
          primaryText={
            <FormattedMessage {...submissionsTranslations.downloadAnswers} />
          }
        />
        <MenuItem
          className={
            downloadStatisticsDisabled
              ? 'download-statistics-disabled'
              : 'download-statistics-enabled'
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
          primaryText={
            <FormattedMessage {...submissionsTranslations.downloadStatistics} />
          }
        />
        {assessment.canUnsubmitSubmission ? (
          <MenuItem
            className={
              unsubmitAllDisabled
                ? 'unsubmit-submissions-disabled'
                : 'unsubmit-submissions-enabled'
            }
            disabled={unsubmitAllDisabled}
            leftIcon={
              isUnsubmitting ? (
                <CircularProgress size={30} />
              ) : (
                <RemoveCircle color={pink600} />
              )
            }
            onClick={() => this.setState({ unsubmitAllConfirmation: true })}
            primaryText={
              <FormattedMessage
                {...submissionsTranslations.unsubmitAllSubmissions}
              />
            }
          />
        ) : null}
        {assessment.canDeleteAllSubmissions ? (
          <MenuItem
            className={
              deleteAllDisabled
                ? 'delete-submissions-disabled'
                : 'delete-submissions-enabled'
            }
            disabled={deleteAllDisabled}
            leftIcon={
              isDeleting ? (
                <CircularProgress size={30} />
              ) : (
                <DeleteIcon color={red900} />
              )
            }
            onClick={() => this.setState({ deleteAllConfirmation: true })}
            primaryText={
              <FormattedMessage
                {...submissionsTranslations.deleteAllSubmissions}
              />
            }
          />
        ) : null}
      </IconMenu>
    );
  }

  renderRowUsers() {
    const {
      dispatch,
      courseId,
      assessmentId,
      submissions,
      assessment,
      isDownloading,
      isStatisticsDownloading,
      isUnsubmitting,
      isDeleting,
    } = this.props;

    const props = {
      dispatch,
      courseId,
      assessmentId,
      assessment,
      isDownloading,
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
        message={
          <FormattedMessage
            {...translations.unsubmitAllConfirmation}
            values={{ users: confirmDialogValue }}
          />
        }
        onCancel={() => this.setState({ unsubmitAllConfirmation: false })}
        onConfirm={() => {
          this.setState({ unsubmitAllConfirmation: false });
          handleUnsubmitAll();
        }}
        open={unsubmitAllConfirmation}
      />
    );
  }

  render() {
    const { assessment } = this.props;

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
      <>
        <Table selectable={false}>
          <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
            <TableRow>
              {tableHeaderColumnFor('userName')}
              {tableHeaderCenterColumnFor('submissionStatus')}
              {tableHeaderCenterColumnFor('grade')}
              {assessment.gamified
                ? tableHeaderCenterColumnFor('experiencePoints')
                : null}
              {tableHeaderCenterColumnFor('dateSubmitted')}
              {tableHeaderCenterColumnFor('dateGraded')}
              <TableHeaderColumn
                style={{ ...styles.tableCell, ...styles.tableCenterCell }}
              >
                {this.renderDownloadDropdown()}
                {this.renderUnsubmitAllConfirmation()}
                {this.renderDeleteAllConfirmation()}
              </TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={false}>
            {this.renderRowUsers()}
          </TableBody>
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
  isDownloading: PropTypes.bool.isRequired,
  isStatisticsDownloading: PropTypes.bool.isRequired,
  isUnsubmitting: PropTypes.bool.isRequired,
  isDeleting: PropTypes.bool.isRequired,
  handleDownload: PropTypes.func,
  handleDownloadStatistics: PropTypes.func,
  handleUnsubmitAll: PropTypes.func,
  handleDeleteAll: PropTypes.func,
  confirmDialogValue: PropTypes.string,
};
