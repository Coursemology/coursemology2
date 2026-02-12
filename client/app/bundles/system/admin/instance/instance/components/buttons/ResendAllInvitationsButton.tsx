import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import { LoadingButton } from '@mui/lab';

import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { resendAllInvitations } from '../../operations';

const translations = defineMessages({
  buttonText: {
    id: 'system.admin.instance.instance.ResendAllInvitationsButton.buttonText',
    defaultMessage: 'Resend Pending Invitations ({count})',
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

interface Props {
  count: number;
}

const ResendAllInvitationsButton: FC<Props> = (props) => {
  const { count } = props;
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleResend = (): Promise<void> => {
    setIsLoading(true);
    return dispatch(resendAllInvitations())
      .then(() => {
        toast.success(t(translations.resendSuccess));
      })
      .catch(() => {
        toast.error(t(translations.resendFailure));
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <LoadingButton
      disabled={count === 0}
      loading={isLoading}
      onClick={handleResend}
      variant="contained"
    >
      {t(translations.buttonText, { count })}
    </LoadingButton>
  );
};

export default ResendAllInvitationsButton;
