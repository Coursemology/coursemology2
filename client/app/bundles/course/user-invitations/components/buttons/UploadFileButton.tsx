import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import { Button } from '@mui/material';
import { InvitationResult } from 'types/course/userInvitations';

import useTranslation from 'lib/hooks/useTranslation';

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
    <Button onClick={(): void => setIsOpen(true)} variant="contained">
      {t(translations.uploadFile)}
    </Button>
  );

  const uploadFileDialog = (
    <InviteUsersFileUpload
      onClose={(): void => setIsOpen(false)}
      open={isOpen}
      openResultDialog={openResultDialog}
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
