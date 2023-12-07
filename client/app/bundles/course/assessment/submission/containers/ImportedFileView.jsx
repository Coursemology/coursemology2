import { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Chip, Typography } from '@mui/material';
import PropTypes from 'prop-types';

import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';

import { workflowStates } from '../constants';
import { fileShape } from '../propTypes';

const translations = defineMessages({
  uploadedFiles: {
    id: 'course.assessment.submission.ImportedFileView.uploadedFiles',
    defaultMessage: 'Uploaded Files:',
  },
  deleteConfirmation: {
    id: 'course.assessment.submission.ImportedFileView.deleteConfirmation',
    defaultMessage: 'Are you sure you want to delete this file?',
  },
  noFiles: {
    id: 'course.assessment.submission.ImportedFileView.noFiles',
    defaultMessage: 'No files uploaded.',
  },
});

const styles = {
  chip: {
    margin: 4,
  },
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    marginTop: 10,
  },
};

class VisibleImportedFileView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deleteConfirmation: false,
      deleteFileId: null,
    };
  }

  renderDeleteDialog() {
    const { deleteFileId, deleteConfirmation } = this.state;
    const { intl, handleDeleteFile } = this.props;
    return (
      <ConfirmationDialog
        message={intl.formatMessage(translations.deleteConfirmation)}
        onCancel={() =>
          this.setState({ deleteConfirmation: false, deleteFileId: null })
        }
        onConfirm={() => {
          handleDeleteFile(deleteFileId);
          this.setState({ deleteConfirmation: false, deleteFileId: null });
        }}
        open={deleteConfirmation}
      />
    );
  }

  renderFile(file, index) {
    const { canDestroyFiles, displayFileIndex, handleFileTabbing } = this.props;

    const onRequestDelete = canDestroyFiles
      ? () =>
          this.setState({
            deleteConfirmation: true,
            deleteFileId: file.id,
          })
      : null;

    const chipColor = displayFileIndex === index ? 'primary' : undefined;
    const staged = file.staged || false;
    return (
      !staged && (
        <Chip
          key={file.id}
          clickable
          color={chipColor}
          label={file.filename}
          onClick={() => handleFileTabbing(index)}
          onDelete={onRequestDelete}
          style={styles.chip}
        />
      )
    );
  }

  render() {
    const { intl, files } = this.props;
    return (
      <div>
        <Typography variant="body2">
          {intl.formatMessage(translations.uploadedFiles)}
        </Typography>
        <div style={styles.wrapper}>
          {files.length ? (
            files.map(this.renderFile, this)
          ) : (
            <Typography variant="body2">
              {intl.formatMessage(translations.noFiles)}
            </Typography>
          )}
        </div>
        {this.renderDeleteDialog()}
      </div>
    );
  }
}

VisibleImportedFileView.propTypes = {
  intl: PropTypes.object.isRequired,
  canDestroyFiles: PropTypes.bool,
  displayFileIndex: PropTypes.number,
  handleFileTabbing: PropTypes.func,
  handleDeleteFile: PropTypes.func,
  files: PropTypes.arrayOf(fileShape),
};

function mapStateToProps(state, ownProps) {
  const {
    displayFileIndex,
    handleFileTabbing,
    handleDeleteFile,
    files,
    viewHistory,
  } = ownProps;
  const { submission } = state.assessments.submission;
  const canDestroyFiles =
    submission.workflowState === workflowStates.Attempting &&
    submission.isCreator &&
    !viewHistory;

  return {
    canDestroyFiles,
    displayFileIndex,
    handleFileTabbing,
    handleDeleteFile,
    files,
  };
}

const ImportedFileView = connect(mapStateToProps)(
  injectIntl(VisibleImportedFileView),
);
export default ImportedFileView;
