import { FC, useState } from 'react';
import { Button } from '@mui/material';
import { injectIntl, defineMessages, WrappedComponentProps } from 'react-intl';
import { InvitationResult } from 'types/course/userInvitations';
import InviteUsersFileUpload from '../../pages/InviteUsersFileUpload';

interface Props extends WrappedComponentProps {
  openResultDialog: (invitationResult: InvitationResult) => void;
}

const translations = defineMessages({
  uploadFile: {
    id: 'course.userInvitation.uploadFile',
    defaultMessage: 'Invite from file',
  },
});

const UploadFileButton: FC<Props> = (props) => {
  const { openResultDialog, intl } = props;
  const [isOpen, setIsOpen] = useState(false);

  const uploadFileButton = (
    <Button variant="contained" onClick={(): void => setIsOpen(true)}>
      {intl.formatMessage(translations.uploadFile)}
    </Button>
  );

  const uploadFileDialog = (
    <InviteUsersFileUpload
      open={isOpen}
      openResultDialog={openResultDialog}
      handleClose={(): void => setIsOpen(false)}
    />
  );

  return (
    <>
      {uploadFileButton}
      {uploadFileDialog}
    </>
  );
};

export default injectIntl(UploadFileButton);
