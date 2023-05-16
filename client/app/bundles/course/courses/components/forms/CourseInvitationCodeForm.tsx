import { FC, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { toast } from 'react-toastify';
import { Button, TextField } from '@mui/material';

import { getRegistrationURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import { useAppDispatch } from 'lib/hooks/store';

import { sendNewRegistrationCode } from '../../operations';

interface Props extends WrappedComponentProps {}

const translations = defineMessages({
  placeholder: {
    id: 'course.courses.CourseInvitationCodeForm.placeholder',
    defaultMessage: 'Invitation code',
  },
  registerButton: {
    id: 'course.courses.CourseInvitationCodeForm.registerButton',
    defaultMessage: 'Register',
  },
  codeSubmitFailure: {
    id: 'course.courses.CourseInvitationCodeForm.codeSubmitFailure',
    defaultMessage: 'Your code is incorrect',
  },
  emptyCodeFailure: {
    id: 'course.courses.CourseInvitationCodeForm.emptyCodeFailure',
    defaultMessage: 'Please enter an invitation code',
  },
});

const CourseInvitationCodeForm: FC<Props> = (props) => {
  const { intl } = props;

  const [code, setCode] = useState('');

  const dispatch = useAppDispatch();

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
        onChange={(event): void => {
          setCode(event.target.value);
        }}
        size="small"
        style={{ marginRight: 5 }}
        value={code}
        variant="outlined"
      />

      <Button
        id="register-button"
        onClick={handleSubmit}
        size="small"
        style={{ height: 40 }}
        variant="contained"
      >
        {intl.formatMessage(translations.registerButton)}
      </Button>
    </div>
  );
};

export default injectIntl(CourseInvitationCodeForm);
