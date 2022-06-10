import { FC, useState } from 'react';
import { Button } from '@mui/material';
import { injectIntl, defineMessages, WrappedComponentProps } from 'react-intl';
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
    <Button variant="contained" onClick={(): void => setIsOpen(true)}>
      {intl.formatMessage(translations.registrationCode)}
    </Button>
  );

  const registrationCodeDialog = (
    <InviteUsersRegistrationCode
      open={isOpen}
      handleClose={(): void => setIsOpen(false)}
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
