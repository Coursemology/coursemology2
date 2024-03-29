import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import {
  ExperiencePointsRecordPermissions,
  ExperiencePointsRowData,
} from 'types/course/experiencePointsRecords';

import {
  deleteExperiencePointsRecord,
  updateExperiencePointsRecord,
} from 'course/experience-points/operations';
import DeleteButton from 'lib/components/core/buttons/DeleteButton';
import SaveButton from 'lib/components/core/buttons/SaveButton';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

interface Props {
  permissions: ExperiencePointsRecordPermissions;
  data: ExperiencePointsRowData;
  isManuallyAwarded: boolean;
  handleSave: (newData: ExperiencePointsRowData) => void;
  studentId: number;
  saveDisabled: boolean;
  deleteDisabled: boolean;
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
  const {
    permissions,
    data,
    isManuallyAwarded,
    handleSave,
    studentId,
    saveDisabled,
    deleteDisabled,
  } = props;
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const onSave = (): void => {
    setIsSaving(true);
    dispatch(updateExperiencePointsRecord(data, studentId))
      .then((response) => {
        const experiencePointsRowData = {
          id: response.id,
          reason: response.reason.text,
          pointsAwarded: response.pointsAwarded,
        };
        handleSave(experiencePointsRowData);
        toast.success(t(translations.updateSuccess));
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          t(translations.updateFailure, {
            error: errorMessage,
          }),
        );
      })
      .finally(() => setIsSaving(false));
  };

  const onDelete = (): Promise<void> => {
    setIsDeleting(true);
    return dispatch(deleteExperiencePointsRecord(data.id, studentId))
      .then(() => {
        toast.success(t(translations.deletionSuccess));
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          t(translations.deletionFailure, {
            error: errorMessage,
          }),
        );
      })
      .finally(() => setIsDeleting(false));
  };

  return (
    <div key={`buttons-${data.id}`} className="whitespace-nowrap">
      {permissions.canUpdate && (
        <SaveButton
          className={`record-save-${data.id}`}
          disabled={isSaving || isDeleting || saveDisabled}
          onClick={onSave}
          tooltip="Save Changes"
        />
      )}
      {permissions.canDestroy && isManuallyAwarded && (
        <DeleteButton
          className={`record-delete-${data.id}`}
          confirmMessage={t(translations.deletionConfirm, {
            pointsAwarded: data.pointsAwarded.toString(),
          })}
          disabled={isSaving || isDeleting || deleteDisabled}
          loading={isDeleting}
          onClick={onDelete}
          tooltip="Delete Experience Point"
        />
      )}
    </div>
  );
};

export default PointManagementButtons;
