import { Component } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import Chip from 'material-ui/Chip';
import PropTypes from 'prop-types';

import ConfirmationDialog from 'lib/components/ConfirmationDialog';

import destroy from '../actions/attachments';
import { workflowStates } from '../constants';
import { attachmentShape } from '../propTypes';

const translations = defineMessages({
  uploadedFiles: {
    id: 'course.assessment.submission.UploadedFileView.uploadedFiles',
    defaultMessage: 'Uploaded Files:',
  },
  deleteConfirmation: {
    id: 'course.assessment.submission.UploadedFileView.deleteConfirmation',
    defaultMessage: 'Are you sure you want to delete this attachment?',
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
    };
  }

  renderAttachment(attachment) {
    const { canDestroyAttachments } = this.props;

    const onRequestDelete = canDestroyAttachments
      ? () =>
          this.setState({
            deleteConfirmation: true,
            deleteAttachmentId: attachment.id,
          })
      : null;

    return (
      <Chip
        key={attachment.id}
        onRequestDelete={onRequestDelete}
        style={styles.chip}
      >
        <a
          download={true}
          href={VisibleUploadedFileView.buildAttachmentUrl(attachment)}
        >
          {attachment.name}
        </a>
      </Chip>
    );
  }

  renderDeleteDialog() {
    const { deleteAttachmentId, deleteConfirmation } = this.state;
    const { intl, deleteAttachment } = this.props;
    return (
      <ConfirmationDialog
        message={intl.formatMessage(translations.deleteConfirmation)}
        onCancel={() =>
          this.setState({ deleteConfirmation: false, deleteAttachmentId: null })
        }
        onConfirm={() => {
          deleteAttachment(deleteAttachmentId);
          this.setState({
            deleteConfirmation: false,
            deleteAttachmentId: null,
          });
        }}
        open={deleteConfirmation}
      />
    );
  }

  render() {
    const { intl, attachments } = this.props;
    return (
      <>
        <strong>{intl.formatMessage(translations.uploadedFiles)}</strong>
        <div style={styles.wrapper}>
          {attachments.length ? (
            attachments.map(this.renderAttachment, this)
          ) : (
            <span>{intl.formatMessage(translations.noFiles)}</span>
          )}
        </div>
        {this.renderDeleteDialog()}
      </>
    );
  }
}

VisibleUploadedFileView.propTypes = {
  intl: intlShape.isRequired,
  canDestroyAttachments: PropTypes.bool,
  attachments: PropTypes.arrayOf(attachmentShape),

  deleteAttachment: PropTypes.func,
};

function mapStateToProps(state, ownProps) {
  const { questionId } = ownProps;
  const { submission } = state;

  const canDestroyAttachments =
    submission.workflowState === workflowStates.Attempting &&
    submission.isCreator;

  return {
    canDestroyAttachments,
    attachments: state.attachments[questionId],
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  const { questionId } = ownProps;
  return {
    deleteAttachment: (attachmentId) =>
      dispatch(destroy(questionId, attachmentId)),
  };
}

const UploadedFileView = connect(
  mapStateToProps,
  mapDispatchToProps,
)(injectIntl(VisibleUploadedFileView));
export default UploadedFileView;
