import { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Chip, Typography } from '@mui/material';
import PropTypes from 'prop-types';

import Prompt, { PromptText } from 'lib/components/core/dialogs/Prompt';

import { workflowStates } from '../constants';
import { fileShape } from '../propTypes';

const translations = defineMessages({
  uploadedFiles: {
    id: 'course.assessment.submission.ImportedFileView.uploadedFiles',
    defaultMessage: 'Uploaded Files:',
  },
  deleteConfirmation: {
    id: 'course.assessment.submission.ImportedFileView.deleteConfirmation',
    defaultMessage: 'Are you sure you want to delete {fileName}?',
  },
  deleting: {
    id: 'course.assessment.submission.ImportedFileView.deleting',
    defaultMessage: 'Delete',
  },
  deleteTitle: {
    id: 'course.assessment.submission.ImportedFileView.deleteTitle',
    defaultMessage: 'Delete File',
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
      deleteFileName: null,
    };
  }

  renderDeleteDialog() {
    const { deleteFileName, deleteFileId, deleteConfirmation } = this.state;
    const { intl, handleDeleteFile } = this.props;
    return (
      <Prompt
        onClickPrimary={() => {
          handleDeleteFile(deleteFileId, deleteFileName);
          this.setState({
            deleteConfirmation: false,
            deleteFileId: null,
            deleteFileName: null,
          });
        }}
        onClose={() =>
          this.setState({
            deleteConfirmation: false,
            deleteFileId: null,
            deleteFileName: null,
          })
        }
        open={deleteConfirmation}
        primaryColor="error"
        primaryLabel={intl.formatMessage(translations.deleting)}
        title={intl.formatMessage(translations.deleteTitle)}
      >
        <PromptText>
          {intl.formatMessage(translations.deleteConfirmation, {
            fileName: deleteFileName,
          })}
        </PromptText>
      </Prompt>
    );
  }

  renderFile(file) {
    const { canDestroyFiles, displayFileName, handleFileTabbing } = this.props;

    const onRequestDelete = canDestroyFiles
      ? () =>
          this.setState({
            deleteConfirmation: true,
            deleteFileId: file.id,
            deleteFileName: file.filename,
          })
      : null;

    const chipColor = displayFileName === file.filename ? 'primary' : undefined;
    const staged = file.staged || false;
    return (
      !staged && (
        <Chip
          key={file.id}
          clickable
          color={chipColor}
          label={file.filename}
          onClick={() => handleFileTabbing(file.filename)}
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
  displayFileName: PropTypes.string,
  handleFileTabbing: PropTypes.func,
  handleDeleteFile: PropTypes.func,
  files: PropTypes.arrayOf(fileShape),
};

function mapStateToProps(state, ownProps) {
  const {
    displayFileName,
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
    displayFileName,
    handleFileTabbing,
    handleDeleteFile,
    files,
  };
}

const ImportedFileView = connect(mapStateToProps)(
  injectIntl(VisibleImportedFileView),
);
export default ImportedFileView;
