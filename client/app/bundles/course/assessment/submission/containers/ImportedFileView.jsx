import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl, defineMessages } from 'react-intl';

import Chip from 'material-ui/Chip';
import { green100 } from 'material-ui/styles/colors';

import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import { fileShape } from '../propTypes';
import { workflowStates } from '../constants';

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

  renderFile(file, index) {
    const { canDestroyFiles, displayFileIndex, handleFileTabbing } = this.props;

    const onRequestDelete = canDestroyFiles
      ? () =>
          this.setState({
            deleteConfirmation: true,
            deleteFileId: file.id,
          })
      : null;

    const chipColor = displayFileIndex === index ? green100 : null;
    const staged = file.staged || false;

    return staged ? null : (
      <Chip
        key={file.id}
        style={styles.chip}
        onRequestDelete={onRequestDelete}
        backgroundColor={chipColor}
        onClick={() => handleFileTabbing(index)}
      >
        {file.filename}
      </Chip>
    );
  }

  renderDeleteDialog() {
    const { deleteFileId, deleteConfirmation } = this.state;
    const { intl, handleDeleteFile } = this.props;
    return (
      <ConfirmationDialog
        open={deleteConfirmation}
        onCancel={() =>
          this.setState({ deleteConfirmation: false, deleteFileId: null })
        }
        onConfirm={() => {
          handleDeleteFile(deleteFileId);
          this.setState({ deleteConfirmation: false, deleteFileId: null });
        }}
        message={intl.formatMessage(translations.deleteConfirmation)}
      />
    );
  }

  render() {
    const { intl, files } = this.props;
    return (
      <div>
        <strong>{intl.formatMessage(translations.uploadedFiles)}</strong>
        <div style={styles.wrapper}>
          {files.length ? (
            files.map(this.renderFile, this)
          ) : (
            <span>{intl.formatMessage(translations.noFiles)}</span>
          )}
        </div>
        {this.renderDeleteDialog()}
      </div>
    );
  }
}

VisibleImportedFileView.propTypes = {
  intl: intlShape.isRequired,
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
  const { submission } = state;
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
