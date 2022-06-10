import { FC, useState } from 'react';
import { Button } from '@mui/material';
import { injectIntl, defineMessages, WrappedComponentProps } from 'react-intl';
import InviteUsersFileUpload from '../../pages/InviteUsersFileUpload';

type Props = WrappedComponentProps;

const translations = defineMessages({
  uploadFile: {
    id: 'course.userInvitation.uploadFile',
    defaultMessage: 'Upload File',
  },
});

const UploadFileButton: FC<Props> = (props) => {
  const { intl } = props;
  const [isOpen, setIsOpen] = useState(false);

  const uploadFileButton = (
    <Button variant="contained" onClick={(): void => setIsOpen(true)}>
      {intl.formatMessage(translations.uploadFile)}
    </Button>
  );

  const uploadFileDialog = (
    <InviteUsersFileUpload
      open={isOpen}
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
