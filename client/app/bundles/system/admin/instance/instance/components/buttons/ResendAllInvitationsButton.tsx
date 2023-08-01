import { FC, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { LoadingButton } from '@mui/lab';

import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';

import { resendAllInvitations } from '../../operations';

const translations = defineMessages({
  buttonText: {
    id: 'system.admin.instance.instance.ResendAllInvitationsButton.buttonText',
    defaultMessage: 'Resend All Invitations',
  },
  resendSuccess: {
    id: 'system.admin.instance.instance.ResendAllInvitationsButton.resendSuccess',
    defaultMessage: 'Email invitations were successfully resent.',
  },
  resendFailure: {
    id: 'system.admin.instance.instance.ResendAllInvitationsButton.resendFailure',
    defaultMessage: 'Failed to resend email invitations.',
  },
});

type Props = WrappedComponentProps;

const ResendAllInvitationsButton: FC<Props> = (props) => {
  const { intl } = props;
  const dispatch = useAppDispatch();
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

export default injectIntl(ResendAllInvitationsButton);
