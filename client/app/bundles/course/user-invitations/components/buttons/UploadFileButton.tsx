import { FC, useState } from 'react';
import { Button } from '@mui/material';
import { defineMessages } from 'react-intl';
import useTranslation from 'lib/hooks/useTranslation';
import { InvitationResult } from 'types/course/userInvitations';
import InviteUsersFileUpload from '../../pages/InviteUsersFileUpload';

interface Props {
  openResultDialog: (invitationResult: InvitationResult) => void;
}

const translations = defineMessages({
  uploadFile: {
    id: 'course.userInvitation.uploadFile',
    defaultMessage: 'Invite from file',
  },
});

const UploadFileButton: FC<Props> = (props) => {
  const { openResultDialog } = props;
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const uploadFileButton = (
    <Button variant="contained" onClick={(): void => setIsOpen(true)}>
      {t(translations.uploadFile)}
    </Button>
  );

  const uploadFileDialog = (
    <InviteUsersFileUpload
      open={isOpen}
      openResultDialog={openResultDialog}
      onClose={(): void => setIsOpen(false)}
    />
  );

  return (
    <>
      {uploadFileButton}
      {uploadFileDialog}
    </>
  );
};

export default UploadFileButton;
