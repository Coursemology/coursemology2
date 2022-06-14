import LoadingButton from '@mui/lab/LoadingButton';
import { useDispatch } from 'react-redux';
import { FC, useState } from 'react';
import { injectIntl, defineMessages, WrappedComponentProps } from 'react-intl';
import { toast } from 'react-toastify';
import { AppDispatch } from 'types/store';
import { fetchInvitations, resendAllInvitations } from '../../operations';

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
        dispatch(fetchInvitations());
        toast.success(intl.formatMessage(translations.resendSuccess));
      })
      .catch((error) => {
        toast.error(intl.formatMessage(translations.resendFailure));
        throw error;
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <>
      <LoadingButton
        loading={isLoading}
        variant="contained"
        onClick={handleResend}
      >
        {intl.formatMessage(translations.buttonText)}
      </LoadingButton>
    </>
  );
};

export default injectIntl(ResendInvitationsButton);
