import { FC, memo, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { toast } from 'react-toastify';
import equal from 'fast-deep-equal';
import { EnrolRequestRowData } from 'types/course/enrolRequests';

import AcceptButton from 'lib/components/core/buttons/AcceptButton';
import DeleteButton from 'lib/components/core/buttons/DeleteButton';
import { COURSE_USER_ROLES } from 'lib/constants/sharedConstants';
import { useAppDispatch } from 'lib/hooks/store';

import { approveEnrolRequest, rejectEnrolRequest } from '../../operations';

interface Props extends WrappedComponentProps {
  enrolRequest: EnrolRequestRowData;
}
const styles = {
  buttonStyle: {
    padding: '0px 8px',
  },
};

const translations = defineMessages({
  approveTooltip: {
    id: 'course.enrolRequests.PendingEnrolRequestsButtons.approveTooltip',
    defaultMessage: 'Approve enrol request',
  },
  approveSuccess: {
    id: 'course.enrolRequests.PendingEnrolRequestsButtons.approveSuccess',
    defaultMessage: 'Approved enrol request of {name}!',
  },
  approveFailure: {
    id: 'course.enrolRequests.PendingEnrolRequestsButtons.approveFailure',
    defaultMessage: 'Failed to approve enrol request - {error}',
  },
  rejectTooltip: {
    id: 'course.enrolRequests.PendingEnrolRequestsButtons.rejectTooltip',
    defaultMessage: 'Reject enrol request',
  },
  rejectConfirm: {
    id: 'course.enrolRequests.PendingEnrolRequestsButtons.rejectConfirm',
    defaultMessage:
      'Are you sure you wish to reject enrol request of {role} {name} ({email})?',
  },
  rejectSuccess: {
    id: 'course.enrolRequests.PendingEnrolRequestsButtons.rejectSuccess',
    defaultMessage: 'Enrol request for {name} was rejected.',
  },
  rejectFailure: {
    id: 'course.enrolRequests.PendingEnrolRequestsButtons.rejectFailure',
    defaultMessage: 'Failed to reject enrol request. {error}',
  },
});

const PendingEnrolRequestsButtons: FC<Props> = (props) => {
  const { intl, enrolRequest } = props;
  const dispatch = useAppDispatch();
  const [isApproving, setIsApproving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const onApprove = (): Promise<void> => {
    setIsApproving(true);
    return dispatch(approveEnrolRequest(enrolRequest))
      .then(() => {
        toast.success(
          intl.formatMessage(translations.approveSuccess, {
            name: enrolRequest.name,
          }),
        );
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          intl.formatMessage(translations.approveFailure, {
            error: errorMessage,
          }),
        );
      })
      .finally(() => setIsApproving(false));
  };

  const onDelete = (): Promise<void> => {
    setIsDeleting(true);
    return dispatch(rejectEnrolRequest(enrolRequest.id))
      .then(() => {
        toast.success(
          intl.formatMessage(translations.rejectSuccess, {
            name: enrolRequest.name,
          }),
        );
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          intl.formatMessage(translations.rejectFailure, {
            error: errorMessage,
          }),
        );
      })
      .finally(() => setIsDeleting(false));
  };

  return (
    <div style={{ whiteSpace: 'nowrap' }}>
      <AcceptButton
        className={`enrol-request-approve-${enrolRequest.id}`}
        disabled={isApproving || isDeleting}
        onClick={onApprove}
        sx={styles.buttonStyle}
        tooltip={intl.formatMessage(translations.approveTooltip)}
      />
      <DeleteButton
        className={`enrol-request-reject-${enrolRequest.id}`}
        confirmMessage={intl.formatMessage(translations.rejectConfirm, {
          role: COURSE_USER_ROLES[enrolRequest.role!],
          name: enrolRequest.name,
          email: enrolRequest.email,
        })}
        disabled={isApproving || isDeleting}
        loading={isDeleting}
        onClick={onDelete}
        sx={styles.buttonStyle}
        tooltip={intl.formatMessage(translations.rejectTooltip)}
      />
    </div>
  );
};

export default memo(
  injectIntl(PendingEnrolRequestsButtons),
  (prevProps, nextProps) => {
    return equal(prevProps.enrolRequest, nextProps.enrolRequest);
  },
);
