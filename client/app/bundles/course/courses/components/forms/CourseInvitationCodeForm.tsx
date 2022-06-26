import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { FC, useState } from 'react';
import { Button, TextField } from '@mui/material';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'types/store';
import { getCourseId } from 'lib/helpers/url-helpers';
import { getRegistrationURL } from 'lib/helpers/url-builders';
import { sendNewRegistrationCode } from '../../operations';

interface Props extends WrappedComponentProps {}

const translations = defineMessages({
  placeholder: {
    id: 'course.courses.show.invitation.placeholder',
    defaultMessage: 'Invitation code',
  },
  registerButton: {
    id: 'course.courses.show.invitation.registerButton',
    defaultMessage: 'Register',
  },
  codeSubmitFailure: {
    id: 'course.courses.show.invitation.codeSubmitFailure',
    defaultMessage: 'Your code is incorrect',
  },
  emptyCodeFailure: {
    id: 'course.courses.show.invitation.emptyCodeFailure',
    defaultMessage: 'Please enter an invitation code',
  },
});

const CourseInvitationCodeForm: FC<Props> = (props) => {
  const { intl } = props;

  const [code, setCode] = useState('');

  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = (): Promise<void> => {
    if (code.trim() === '') {
      toast.error(intl.formatMessage(translations.emptyCodeFailure));
      return new Promise<void>(() => {});
    }
    const registrationLink = getRegistrationURL(getCourseId());
    const data = new FormData();
    data.append('registration[code]', code);
    return dispatch(sendNewRegistrationCode(registrationLink, data))
      .then(() => {
        window.location.reload();
      })
      .catch((_error) => {
        toast.error(intl.formatMessage(translations.codeSubmitFailure));
      });
  };

  return (
    <div style={{ display: 'flex' }}>
      <TextField
        id="registration-code"
        label={intl.formatMessage(translations.placeholder)}
        variant="outlined"
        size="small"
        value={code}
        onChange={(event): void => {
          setCode(event.target.value);
        }}
        style={{ marginRight: 5 }}
      />

      <Button
        id="register-button"
        size="small"
        variant="contained"
        onClick={handleSubmit}
        style={{ height: 40 }}
      >
        {intl.formatMessage(translations.registerButton)}
      </Button>
    </div>
  );
};

export default injectIntl(CourseInvitationCodeForm);
