import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl, defineMessages } from 'react-intl';

import Chip from 'material-ui/Chip';

import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import { AttachmentProp } from '../propTypes';
import destroy from '../actions/attachments';

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

  state = {
    deleteConfirmation: false,
    deleteAttachmentId: null,
  };

  buildAttachmentUrl(attachment) {
    return `/attachments/${attachment.id}`;
  }

  renderAttachment(attachment) {
    const { canUpdate } = this.props;

    const onRequestDelete = canUpdate ? () => this.setState({
      deleteConfirmation: true,
      deleteAttachmentId: attachment.id,
    }) : null;

    return (
      <Chip key={attachment.id} style={styles.chip} onRequestDelete={onRequestDelete}>
        <a href={this.buildAttachmentUrl(attachment)} download>
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
        open={deleteConfirmation}
        onCancel={() => this.setState({ deleteConfirmation: false, deleteAttachmentId: null })}
        onConfirm={() => {
          deleteAttachment(deleteAttachmentId);
          this.setState({ deleteConfirmation: false, deleteAttachmentId: null });
        }}
        message={intl.formatMessage(translations.deleteConfirmation)}
      />
    );
  }

  render() {
    const { intl, attachments } = this.props;
    return (
      <div>
        <strong>{intl.formatMessage(translations.uploadedFiles)}</strong>
        <div style={styles.wrapper}>
          {attachments.length ?
            attachments.map(this.renderAttachment, this) :
            <span>{intl.formatMessage(translations.noFiles)}</span>
          }
        </div>
        {this.renderDeleteDialog()}
      </div>
    );
  }
}

VisibleUploadedFileView.propTypes = {
  intl: intlShape.isRequired,
  canUpdate: PropTypes.bool,
  attachments: PropTypes.arrayOf(AttachmentProp),

  deleteAttachment: PropTypes.func,
};

function mapStateToProps(state, ownProps) {
  const { questionId } = ownProps;
  return {
    canUpdate: state.submissionEdit.submission.canUpdate,
    attachments: state.attachments[questionId],
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  const { questionId } = ownProps;
  return {
    deleteAttachment: attachmentId => dispatch(destroy(questionId, attachmentId)),
  };
}

const UploadedFileView = connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(VisibleUploadedFileView));
export default UploadedFileView;
