import { FC, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { Button } from '@mui/material';

import InviteUsersRegistrationCode from '../../pages/InviteUsersRegistrationCode';

type Props = WrappedComponentProps;

const translations = defineMessages({
  registrationCode: {
    id: 'course.userInvitation.registrationCode',
    defaultMessage: 'Registration Code',
  },
});

const RegistrationCodeButton: FC<Props> = (props) => {
  const { intl } = props;
  const [isOpen, setIsOpen] = useState(false);

  const registrationCodeButton = (
    <Button
      className="registration-code"
      onClick={(): void => setIsOpen(true)}
      variant="contained"
    >
      {intl.formatMessage(translations.registrationCode)}
    </Button>
  );

  const registrationCodeDialog = (
    <InviteUsersRegistrationCode
      handleClose={(): void => setIsOpen(false)}
      open={isOpen}
    />
  );

  return (
    <>
      {registrationCodeButton}
      {registrationCodeDialog}
    </>
  );
};

export default injectIntl(RegistrationCodeButton);
