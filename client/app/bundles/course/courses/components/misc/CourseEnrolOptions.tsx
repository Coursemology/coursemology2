import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';

import { useAuthAdapter } from 'lib/components/wrappers/AuthProvider';
import { getEnrolRequestURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { cancelEnrolRequest, submitEnrolRequest } from '../../operations';
import CourseInvitationCodeForm from '../forms/CourseInvitationCodeForm';

interface Props {
  registrationInfo: {
    isDisplayCodeForm: boolean;
    isInvited: boolean;
    enrolRequestId: number | null;
    isEnrollable: boolean;
  };
}

const translations = defineMessages({
  directEnrolSubmit: {
    id: 'course.courses.CourseEnrolOptions.directEnrolSubmit',
    defaultMessage: 'Request to enrol',
  },
  directEnrolCancel: {
    id: 'course.courses.CourseEnrolOptions.directEnrolCancel',
    defaultMessage: 'Cancel request',
  },
  directEnrolSubmitSuccess: {
    id: 'course.courses.CourseEnrolOptions.directEnrolSubmitSuccess',
    defaultMessage: 'Your enrol request has been submitted.',
  },
  directEnrolCancelSuccess: {
    id: 'course.courses.CourseEnrolOptions.directEnrolCancelSuccess',
    defaultMessage: 'Your enrol request has been cancelled.',
  },
  requestFailedMessage: {
    id: 'course.courses.CourseEnrolOptions.requestFailedMessage',
    defaultMessage: 'An error occurred, please try again later.',
  },
});

const CourseEnrolOptions: FC<Props> = (props) => {
  const { registrationInfo } = props;

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthAdapter();

  const handleSubmit = (): Promise<void> => {
    const courseId = getCourseId()!;
    const link = getEnrolRequestURL(courseId);
    return dispatch(submitEnrolRequest(link, +courseId))
      .then((action) => {
        toast.success(t(translations.directEnrolSubmitSuccess));
        if (action.status === 'approved') {
          window.location.reload();
        }
      })
      .catch((_error) => {
        toast.error(t(translations.requestFailedMessage));
      });
  };

  const handleRequestToEnrol = (): void => {
    if (isAuthenticated) {
      handleSubmit();
    } else {
      navigate(`/users/sign_up?enrol_course_id=${getCourseId()}`);
    }
  };

  const handleCancel = (): Promise<void> => {
    const courseId = getCourseId()!;
    const link = `${getEnrolRequestURL(courseId)}/${
      registrationInfo.enrolRequestId
    }`;
    return dispatch(cancelEnrolRequest(link, +courseId))
      .then(() => {
        toast.success(t(translations.directEnrolCancelSuccess));
      })
      .catch((_error) => {
        toast.error(t(translations.requestFailedMessage));
      });
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'left',
        marginTop: 5,
      }}
    >
      <div style={{ marginRight: 15 }}>
        {registrationInfo.isDisplayCodeForm && <CourseInvitationCodeForm />}
      </div>

      {!registrationInfo.isInvited && (
        <>
          {registrationInfo.isDisplayCodeForm &&
            registrationInfo.isEnrollable && (
              <h5 style={{ marginRight: 15 }}>OR</h5>
            )}

          <div>
            {registrationInfo.enrolRequestId && (
              <Button
                id="cancel-enrol-request-button"
                onClick={handleCancel}
                size="small"
                style={{ height: 40 }}
                variant="contained"
              >
                {t(translations.directEnrolCancel)}
              </Button>
            )}
            {!registrationInfo.enrolRequestId &&
              registrationInfo.isEnrollable && (
                <Button
                  id="submit-enrol-request-button"
                  onClick={handleRequestToEnrol}
                  size="small"
                  style={{ height: 40 }}
                  variant="contained"
                >
                  {t(translations.directEnrolSubmit)}
                </Button>
              )}
          </div>
        </>
      )}
    </div>
  );
};

export default CourseEnrolOptions;
