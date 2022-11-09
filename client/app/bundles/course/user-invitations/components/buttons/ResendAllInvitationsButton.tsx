import { FC, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { LoadingButton } from '@mui/lab';
import { AppDispatch } from 'types/store';

import { resendAllInvitations } from '../../operations';

const translations = defineMessages({
  buttonText: {
    id: 'course.userInvitations.components.buttons.resendInvitations',
    defaultMessage: 'Resend All Invitations',
  },
  resendSuccess: {
    id: 'course.userInvitations.components.buttons.resendInvitations.success',
    defaultMessage: 'Email invitations were successfully resent.',
  },
  resendFailure: {
    id: 'course.userInvitations.components.buttons.resendInvitations.failure',
    defaultMessage: 'Email invitations failed to resend.',
  },
});

type Props = WrappedComponentProps;

const ResendInvitationsButton: FC<Props> = (props) => {
  const { intl } = props;
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false);

  const handleResend = (): Promise<void> => {
    setIsLoading(true);
    return dispatch(resendAllInvitations())
      .then(() => {
        toast.success(intl.formatMessage(translations.resendSuccess));
      })
      .catch(() => {
        toast.error(intl.formatMessage(translations.resendFailure));
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <LoadingButton
      loading={isLoading}
      onClick={handleResend}
      variant="contained"
    >
      {intl.formatMessage(translations.buttonText)}
    </LoadingButton>
  );
};

export default injectIntl(ResendInvitationsButton);
