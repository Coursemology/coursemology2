import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl, defineMessages, FormattedMessage } from 'react-intl';

import IconButton from 'material-ui/IconButton';
import DeleteIcon from 'material-ui/svg-icons/action/delete';

import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import { AttachmentProp } from '../propTypes';
import destroy from '../actions/attachments';

const translations = defineMessages({
  delete: {
    id: 'course.assessment.submission.UploadedFileView.delete',
    defaultMessage: 'Delete File',
  },
  uploadedFiles: {
    id: 'course.assessment.submission.UploadedFileView.uploadedFiles',
    defaultMessage: 'Uploaded Files:',
  },
  deleteConfirmation: {
    id: 'course.assessment.submission.UploadedFileView.deleteConfirmation',
    defaultMessage: 'Are you sure you want to delete this attachment?',
  },
});

class VisibleUploadedFileView extends Component {

  state = {
    deleteConfirmation: false,
    deleteAttachmentId: null,
  };

  buildAttachmentUrl(attachment) {
    return `/attachments/${attachment.id}`;
  }

  renderAttachmentRow(attachment) {
    const { intl } = this.props;
    return (
      <tr>
        <td>
          <a href={this.buildAttachmentUrl(attachment)} download>{attachment.name}</a>
        </td>
        <td>
          <IconButton
            tooltip={intl.formatMessage(translations.delete)}
            onTouchTap={() => this.setState({ deleteConfirmation: true, deleteAttachmentId: attachment.id })}
          >
            <DeleteIcon />
          </IconButton>
        </td>
      </tr>
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
    const { attachments } = this.props;
    return (
      <div>
        <FormattedMessage {...translations.uploadedFiles} />
        <table>
          <tbody>
            {attachments.map(attachment => this.renderAttachmentRow(attachment))}
          </tbody>
        </table>
        {this.renderDeleteDialog()}
      </div>
    );
  }
}

VisibleUploadedFileView.propTypes = {
  intl: intlShape.isRequired,
  attachments: PropTypes.arrayOf(AttachmentProp),

  deleteAttachment: PropTypes.func,
};

function mapStateToProps(state, ownProps) {
  const { questionId } = ownProps;
  return {
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
