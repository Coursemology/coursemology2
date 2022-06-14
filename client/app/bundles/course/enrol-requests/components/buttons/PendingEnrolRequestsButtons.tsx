import { FC, useState } from 'react';
import { useDispatch } from 'react-redux';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import DeleteButton from 'lib/components/buttons/DeleteButton';
import AcceptButton from 'lib/components/buttons/AcceptButton';
import { toast } from 'react-toastify';
import { AppDispatch } from 'types/store';
import sharedConstants from 'lib/constants/sharedConstants';
import { EnrolRequestEntity } from 'types/course/enrolRequests';
import { approveEnrolRequest, rejectEnrolRequest } from '../../operations';

interface Props extends WrappedComponentProps {
  enrolRequest: EnrolRequestEntity;
}

const translations = defineMessages({
  approveTooltip: {
    id: 'course.enrolRequests.approve',
    defaultMessage: 'Approve enrol request',
  },
  approveSuccess: {
    id: 'course.enrolRequests.approve.success',
    defaultMessage: 'Approved enrol request of {name}!',
  },
  approveFailure: {
    id: 'course.enrolRequests.approve.fail',
    defaultMessage: 'Failed to approve enrol request. {error}',
  },
  rejectTooltip: {
    id: 'course.enrolRequests.reject',
    defaultMessage: 'Reject enrol request',
  },
  rejectConfirm: {
    id: 'course.enrolRequests.reject.confirm',
    defaultMessage:
      'Are you sure you wish to reject enrol request of {role} {name} ({email})?',
  },
  rejectSuccess: {
    id: 'course.enrolRequests.reject.success',
    defaultMessage: 'Enrol request for {name} was deleted.',
  },
  rejectFailure: {
    id: 'course.enrolRequests.reject.fail',
    defaultMessage: 'Failed to delete enrol request. {error}',
  },
});

const ROLES = sharedConstants.USER_ROLES;

const PendingEnrolRequestsButtons: FC<Props> = (props) => {
  const { intl, enrolRequest } = props;
  const dispatch = useDispatch<AppDispatch>();
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
        toast.error(
          intl.formatMessage(translations.approveFailure, {
            error: error.message,
          }),
        );
        throw error;
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
        toast.error(
          intl.formatMessage(translations.rejectFailure, {
            error,
          }),
        );
        throw error;
      })
      .finally(() => setIsDeleting(false));
  };

  const managementButtons = (
    <div style={{ whiteSpace: 'nowrap' }}>
      <AcceptButton
        tooltip={intl.formatMessage(translations.approveTooltip)}
        className={`enrol-request-approve-${enrolRequest.id}`}
        disabled={isApproving || isDeleting}
        onClick={onApprove}
      />
      <DeleteButton
        tooltip={intl.formatMessage(translations.rejectTooltip)}
        className={`enrol-request-reject-${enrolRequest.id}`}
        disabled={isApproving || isDeleting}
        onClick={onDelete}
        confirmMessage={intl.formatMessage(translations.rejectConfirm, {
          role: ROLES.find((role) => role.value === enrolRequest.role)?.label,
          name: enrolRequest.name,
          email: enrolRequest.email,
        })}
      />
    </div>
  );

  return managementButtons;
};

export default injectIntl(PendingEnrolRequestsButtons);
