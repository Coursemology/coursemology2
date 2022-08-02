import { FC, useState } from 'react';
import { useDispatch } from 'react-redux';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import DeleteButton from 'lib/components/buttons/DeleteButton';
import SaveButton from 'lib/components/buttons/SaveButton';
import { toast } from 'react-toastify';
import { AppDispatch } from 'types/store';
import {
  ExperiencePointsRecordPermissions,
  ExperiencePointsRowData,
} from 'types/course/experiencePointsRecords';
import {
  deleteExperiencePointsRecord,
  updateExperiencePointsRecord,
} from '../../operations';

interface Props extends WrappedComponentProps {
  permissions: ExperiencePointsRecordPermissions;
  data: ExperiencePointsRowData;
  isDirty: boolean;
  manuallyAwarded: boolean;
}

const translations = defineMessages({
  deletionSuccess: {
    id: 'course.users.components.buttons.PointManagementButtons.delete.success',
    defaultMessage: 'Experience points record was deleted.',
  },
  deletionFailure: {
    id: 'course.users.components.buttons.PointManagementButtons.delete.fail',
    defaultMessage: 'Failed to delete record.',
  },
  deletionConfirm: {
    id: 'course.users.components.buttons.PointManagementButtons.delete.confirm',
    defaultMessage:
      'Are you sure you wish to delete this record with {pointsAwarded} point(s) awarded?',
  },
  updateSuccess: {
    id: 'course.users.components.buttons.PointManagementButtons.update.success',
    defaultMessage: 'Experience points record was updated.',
  },
  updateFailure: {
    id: 'course.users.components.buttons.PointManagementButtons.update.fail',
    defaultMessage: 'Failed to update record',
  },
});

const PointManagementButtons: FC<Props> = (props) => {
  const { intl, permissions, data, isDirty, manuallyAwarded } = props;
  const dispatch = useDispatch<AppDispatch>();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const onSave = (newData: ExperiencePointsRowData): Promise<void> => {
    setIsSaving(true);
    return dispatch(updateExperiencePointsRecord(newData))
      .then(() => {
        toast.success(intl.formatMessage(translations.updateSuccess));
      })
      .catch((error) => {
        toast.error(intl.formatMessage(translations.updateFailure));
        throw error;
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
        toast.error(intl.formatMessage(translations.deletionFailure));
        throw error;
      })
      .finally(() => setIsDeleting(false));
  };

  const managementButtons = (
    <div style={{ whiteSpace: 'nowrap' }} key={`buttons-${data.id}`}>
      {permissions.canUpdate && (
        <SaveButton
          tooltip="Save Changes"
          className={`record-save-${data.id}`}
          disabled={isSaving || isDeleting || !isDirty}
          onClick={(): Promise<void> => onSave(data)}
        />
      )}
      {permissions.canDestroy && manuallyAwarded && (
        <DeleteButton
          tooltip="Delete User"
          className={`record-delete-${data.id}`}
          disabled={isSaving || isDeleting}
          loading={isDeleting}
          onClick={onDelete}
          confirmMessage={intl.formatMessage(translations.deletionConfirm, {
            pointsAwarded: data.pointsAwarded.toString(),
          })}
        />
      )}
    </div>
  );

  return managementButtons;
};

export default injectIntl(PointManagementButtons);
