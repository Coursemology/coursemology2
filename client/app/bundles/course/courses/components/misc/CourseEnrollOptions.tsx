import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { FC } from 'react';
import { Button } from '@mui/material';
import { toast } from 'react-toastify';
import { AppDispatch } from 'types/store';
import { useDispatch } from 'react-redux';
import { getCourseId } from 'lib/helpers/url-helpers';
import { getEnrolRequestURL } from 'lib/helpers/url-builders';
import CourseInvitationCodeForm from '../forms/CourseInvitationCodeForm';
import { cancelEnrolRequest, submitEnrolRequest } from '../../operations';

interface Props extends WrappedComponentProps {
  registrationInfo: {
    isDisplayCodeForm: boolean;
    isInvited: boolean;
    enrolRequestId: number | null;
    isEnrollable: boolean;
  };
}

const translations = defineMessages({
  directEnrolSubmit: {
    id: 'course.courses.show.directEnrolSubmit',
    defaultMessage: 'Request to enrol',
  },
  directEnrolCancel: {
    id: 'course.courses.show.directEnrolCancel',
    defaultMessage: 'Cancel request',
  },
  directEnrolSubmitSuccess: {
    id: 'course.courses.show.directEnrolSubmitSuccess',
    defaultMessage: 'Your enrol request has been submitted.',
  },
  directEnrolCancelSuccess: {
    id: 'course.courses.show.directEnrolCancelSuccess',
    defaultMessage: 'Your enrol request has been cancelled.',
  },
  requestFailedMessage: {
    id: 'course.courses.show.enrolRequestFailed',
    defaultMessage: 'An error occured, please try again later.',
  },
});

const CourseEnrollOptions: FC<Props> = (props) => {
  const { intl, registrationInfo } = props;

  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = (): Promise<void> => {
    const courseId = getCourseId()!;
    const link = getEnrolRequestURL(courseId);
    return dispatch(submitEnrolRequest(link, +courseId))
      .then(() => {
        toast.success(
          intl.formatMessage(translations.directEnrolSubmitSuccess),
        );
      })
      .catch((_error) => {
        toast.error(intl.formatMessage(translations.requestFailedMessage));
      });
  };

  const handleCancel = (): Promise<void> => {
    const courseId = getCourseId()!;
    const link = `${getEnrolRequestURL(courseId)}/${
      registrationInfo.enrolRequestId
    }`;
    return dispatch(cancelEnrolRequest(link, +courseId))
      .then(() => {
        toast.success(
          intl.formatMessage(translations.directEnrolCancelSuccess),
        );
      })
      .catch((_error) => {
        toast.error(intl.formatMessage(translations.requestFailedMessage));
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
                size="small"
                variant="contained"
                style={{ height: 40 }}
                onClick={handleCancel}
              >
                {intl.formatMessage(translations.directEnrolCancel)}
              </Button>
            )}
            {registrationInfo.enrolRequestId === null &&
              registrationInfo.isEnrollable && (
                <Button
                  id="submit-enrol-request-button"
                  size="small"
                  variant="contained"
                  style={{ height: 40 }}
                  onClick={handleSubmit}
                >
                  {intl.formatMessage(translations.directEnrolSubmit)}
                </Button>
              )}
          </div>
        </>
      )}
    </div>
  );
};

export default injectIntl(CourseEnrollOptions);
