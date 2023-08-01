import { FC, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import {
  ExperiencePointsRecordPermissions,
  ExperiencePointsRowData,
} from 'types/course/experiencePointsRecords';

import DeleteButton from 'lib/components/core/buttons/DeleteButton';
import SaveButton from 'lib/components/core/buttons/SaveButton';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';

import {
  deleteExperiencePointsRecord,
  updateExperiencePointsRecord,
} from '../../operations';

interface Props extends WrappedComponentProps {
  permissions: ExperiencePointsRecordPermissions;
  data: ExperiencePointsRowData;
  isDirty: boolean;
  isManuallyAwarded: boolean;
  handleSave: (newData: ExperiencePointsRowData) => void;
}

const translations = defineMessages({
  deletionSuccess: {
    id: 'course.users.PointManagementButtons.deletionSuccess',
    defaultMessage: 'Experience points record was deleted.',
  },
  deletionFailure: {
    id: 'course.users.PointManagementButtons.deletionFailure',
    defaultMessage: 'Failed to delete record - {error}',
  },
  deletionConfirm: {
    id: 'course.users.PointManagementButtons.deletionConfirm',
    defaultMessage:
      'Are you sure you wish to delete this record with {pointsAwarded} point(s) awarded?',
  },
  updateSuccess: {
    id: 'course.users.PointManagementButtons.updateSuccess',
    defaultMessage: 'Experience points record was updated.',
  },
  updateFailure: {
    id: 'course.users.PointManagementButtons.updateFailure',
    defaultMessage: 'Failed to update record - {error}',
  },
});

const PointManagementButtons: FC<Props> = (props) => {
  const { intl, permissions, data, isDirty, isManuallyAwarded, handleSave } =
    props;
  const dispatch = useAppDispatch();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const onSave = (): void => {
    setIsSaving(true);
    dispatch(updateExperiencePointsRecord(data))
      .then((response) => {
        const experiencePointsRowData = {
          id: response.data.id,
          reason: response.data.reason.text,
          pointsAwarded: response.data.pointsAwarded,
        };
        handleSave(experiencePointsRowData);
        toast.success(intl.formatMessage(translations.updateSuccess));
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          intl.formatMessage(translations.updateFailure, {
            error: errorMessage,
          }),
        );
      })
      .finally(() => setIsSaving(false));
  };

  const onDelete = (): Promise<void> => {
    setIsDeleting(true);
    return dispatch(deleteExperiencePointsRecord(data.id))
      .then(() => {
        toast.success(intl.formatMessage(translations.deletionSuccess));
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          intl.formatMessage(translations.deletionFailure, {
            error: errorMessage,
          }),
        );
      })
      .finally(() => setIsDeleting(false));
  };

  return (
    <div key={`buttons-${data.id}`} style={{ whiteSpace: 'nowrap' }}>
      {permissions.canUpdate && (
        <SaveButton
          className={`record-save-${data.id}`}
          disabled={isSaving || isDeleting || !isDirty}
          onClick={onSave}
          tooltip="Save Changes"
        />
      )}
      {permissions.canDestroy && isManuallyAwarded && (
        <DeleteButton
          className={`record-delete-${data.id}`}
          confirmMessage={intl.formatMessage(translations.deletionConfirm, {
            pointsAwarded: data.pointsAwarded.toString(),
          })}
          disabled={isSaving || isDeleting}
          loading={isDeleting}
          onClick={onDelete}
          tooltip="Delete Experience Point"
        />
      )}
    </div>
  );
};

export default injectIntl(PointManagementButtons);
