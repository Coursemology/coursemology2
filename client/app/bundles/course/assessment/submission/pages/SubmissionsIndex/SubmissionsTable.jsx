import { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
} from 'material-ui/Table';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import { red600, red900, pink600 } from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';
import CircularProgress from 'material-ui/CircularProgress';
import DownloadIcon from 'material-ui/svg-icons/file/file-download';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import RemoveCircle from 'material-ui/svg-icons/content/remove-circle';
import { assessmentShape } from '../../propTypes';
import { workflowStates } from '../../constants';
import translations from '../../translations';
import submissionsTranslations from './translations';
import SubmissionsTableRow from './SubmissionsTableRow';

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
  constructor(props) {
    super(props);
    this.state = {
      unsubmitAllConfirmation: false,
      deleteAllConfirmation: false,
    };
  }

  canDownloadStatistics = () => {
    const { submissions } = this.props;
    return (
      submissions.length > 0 &&
      submissions.some((s) => s.workflowState !== workflowStates.Unstarted)
    );
  };

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

  canDeleteAll() {
    const { submissions } = this.props;
    return submissions.some(
      (s) => s.workflowState !== workflowStates.Unstarted,
    );
  }

  renderUsers() {
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
                <RemoveCircle color={pink600} />
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
                <DeleteIcon color={red900} />
              )
            }
            onClick={() => this.setState({ deleteAllConfirmation: true })}
          />
        ) : null}
      </IconMenu>
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
          {this.renderUsers(submissions)}
        </TableBody>
      </Table>
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
