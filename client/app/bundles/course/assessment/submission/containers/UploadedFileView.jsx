import { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Chip, Typography } from '@mui/material';
import PropTypes from 'prop-types';

import Prompt, { PromptText } from 'lib/components/core/dialogs/Prompt';
import Link from 'lib/components/core/Link';

import destroy from '../actions/attachments';
import { workflowStates } from '../constants';
import { attachmentShape } from '../propTypes';

const translations = defineMessages({
  uploadedFiles: {
    id: 'course.assessment.submission.UploadedFileView.uploadedFiles',
    defaultMessage: 'Uploaded Files',
  },
  deleteConfirmation: {
    id: 'course.assessment.submission.UploadedFileView.deleteConfirmation',
    defaultMessage: 'Are you sure you want to delete {fileName}?',
  },
  deleting: {
    id: 'course.assessment.submission.UploadedFileView.deleting',
    defaultMessage: 'Delete',
  },
  deleteTitle: {
    id: 'course.assessment.submission.UploadedFileView.deleteTitle',
    defaultMessage: 'Delete File',
  },
  noFiles: {
    id: 'course.assessment.submission.UploadedFileView.noFiles',
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

class VisibleUploadedFileView extends Component {
  static buildAttachmentUrl(attachment) {
    return `/attachments/${attachment.id}`;
  }

  constructor(props) {
    super(props);
    this.state = {
      deleteConfirmation: false,
      deleteAttachmentId: null,
      deleteAttachmentName: null,
    };
  }

  renderAttachment(attachment) {
    const { canDestroyAttachments } = this.props;

    const onDelete = canDestroyAttachments
      ? () =>
          this.setState({
            deleteConfirmation: true,
            deleteAttachmentId: attachment.id,
            deleteAttachmentName: attachment.name,
          })
      : null;

    return (
      <Chip
        key={attachment.id}
        clickable
        label={
          <Link href={VisibleUploadedFileView.buildAttachmentUrl(attachment)}>
            {attachment.name}
          </Link>
        }
        onDelete={onDelete}
        style={styles.chip}
      />
    );
  }

  renderDeleteDialog() {
    const { deleteAttachmentName, deleteAttachmentId, deleteConfirmation } =
      this.state;
    const { intl, deleteAttachment } = this.props;
    return (
      <Prompt
        onClickPrimary={() => {
          deleteAttachment(deleteAttachmentId);
          this.setState({
            deleteConfirmation: false,
            deleteAttachmentId: null,
            deleteAttachmentName: null,
          });
        }}
        onClose={() =>
          this.setState({
            deleteConfirmation: false,
            deleteAttachmentId: null,
            deleteAttachmentName: null,
          })
        }
        open={deleteConfirmation}
        primaryColor="error"
        primaryLabel={intl.formatMessage(translations.deleting)}
        title={intl.formatMessage(translations.deleteTitle)}
      >
        <PromptText>
          {intl.formatMessage(translations.deleteConfirmation, {
            fileName: deleteAttachmentName,
          })}
        </PromptText>
      </Prompt>
    );
  }

  render() {
    const { intl, attachments } = this.props;
    return (
      <div className="mt-4">
        <Typography variant="h6">
          {intl.formatMessage(translations.uploadedFiles)}
        </Typography>
        <div style={styles.wrapper}>
          {attachments.length ? (
            attachments.map(this.renderAttachment, this)
          ) : (
            <Typography color="text.secondary" variant="body2">
              {intl.formatMessage(translations.noFiles)}
            </Typography>
          )}
        </div>
        {this.renderDeleteDialog()}
      </div>
    );
  }
}

VisibleUploadedFileView.propTypes = {
  intl: PropTypes.object.isRequired,
  canDestroyAttachments: PropTypes.bool,
  attachments: PropTypes.arrayOf(attachmentShape),

  deleteAttachment: PropTypes.func,
};

function mapStateToProps(state, ownProps) {
  const { questionId } = ownProps;
  const { submission } = state.assessments.submission;

  const canDestroyAttachments =
    submission.workflowState === workflowStates.Attempting &&
    submission.isCreator;

  return {
    canDestroyAttachments,
    attachments: state.assessments.submission.attachments[questionId],
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  const { questionId, answerId } = ownProps;
  return {
    deleteAttachment: (attachmentId) =>
      dispatch(destroy(answerId, questionId, attachmentId)),
  };
}

const UploadedFileView = connect(
  mapStateToProps,
  mapDispatchToProps,
)(injectIntl(VisibleUploadedFileView));
export default UploadedFileView;
