import { defineMessages } from 'react-intl';
import { FC, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { AppDispatch } from 'types/store';

import { Stack } from '@mui/material';

import EditButton from 'lib/components/core/buttons/EditButton';
import DeleteButton from 'lib/components/core/buttons/DeleteButton';
import useTranslation from 'lib/hooks/useTranslation';

import { deleteFolder, deleteMaterial } from '../../operations';
import FolderEdit from '../../pages/FolderEdit';
import MaterialEdit from '../misc/MaterialEdit';

interface Props {
  currFolderId: number;
  itemId: number;
  itemName: string;
  isConcrete: boolean;
  canEdit: boolean;
  canDelete: boolean;
  type: 'subfolder' | 'material';
  folderInitialValues?: {
    name: string;
    description: string;
    canStudentUpload: boolean;
    startAt: Date;
    endAt: Date | null;
  };
  materialInitialValues?: {
    name: string;
    description: string;
    file: { name: string; url: string };
  };
}

const translations = defineMessages({
  tableButtonDeleteTooltip: {
    id: 'course.materials.folders.tableButtonDeleteTooltip',
    defaultMessage: 'Delete',
  },
  deletionSuccess: {
    id: 'course.materials.folders.deletionSuccess',
    defaultMessage: ' has been deleted',
  },
  deletionFailure: {
    id: 'course.materials.folders.folderDeletionFailure',
    defaultMessage: ' could not be deleted',
  },
  deleteConfirmation: {
    id: 'course.materials.folders.deleteConfirmation',
    defaultMessage: 'Are you sure you want to delete',
  },
});

const WorkbinTableButtons: FC<Props> = (props) => {
  const {
    currFolderId,
    itemId,
    itemName,
    isConcrete,
    canEdit,
    canDelete,
    type,
    folderInitialValues,
    materialInitialValues,
  } = props;
  const { t } = useTranslation();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  const onEdit = (): void => {
    setIsEditOpen(true);
  };

  const onDelete = (): Promise<void> => {
    setIsDeleting(true);
    if (type === 'subfolder') {
      return dispatch(deleteFolder(itemId))
        .then(() => {
          toast.success(`"${itemName}" ${t(translations.deletionSuccess)}`);
        })
        .catch((error) => {
          setIsDeleting(false);
          const errorMessage = error.response?.data?.errors
            ? error.response.data.errors
            : '';
          toast.error(
            `"${itemName}" ${t(
              translations.deletionFailure,
            )} - ${errorMessage}`,
          );
          throw error;
        });
    }
    return dispatch(deleteMaterial(currFolderId, itemId))
      .then(() => {
        toast.success(`"${itemName}" ${t(translations.deletionSuccess)}`);
      })
      .catch((error) => {
        setIsDeleting(false);
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          `"${itemName}" ${t(translations.deletionFailure)} - ${errorMessage}`,
        );
        throw error;
      });
  };

  const renderForm = (): JSX.Element => {
    if (type === 'subfolder' && folderInitialValues) {
      return (
        <FolderEdit
          isOpen={isEditOpen}
          onClose={(): void => {
            setIsEditOpen(false);
          }}
          folderId={itemId}
          initialValues={folderInitialValues}
        />
      );
    }

    if (type === 'material' && materialInitialValues) {
      return (
        <MaterialEdit
          isOpen={isEditOpen}
          onClose={(): void => {
            setIsEditOpen(false);
          }}
          folderId={currFolderId}
          materialId={itemId}
          initialValues={materialInitialValues}
        />
      );
    }

    return <></>;
  };

  return (
    <>
      <Stack direction={{ xs: 'column', sm: 'row' }}>
        {canEdit && isConcrete && (
          <EditButton
            id={`${type}-edit-button-${itemId}`}
            onClick={onEdit}
            style={{ padding: 5 }}
          />
        )}
        {canDelete && isConcrete && (
          <DeleteButton
            id={`${type}-delete-button-${itemId}`}
            onClick={onDelete}
            disabled={isDeleting}
            confirmMessage={`${t(
              translations.deleteConfirmation,
            )} "${itemName}"`}
            style={{ padding: 5 }}
            tooltip={t(translations.tableButtonDeleteTooltip)}
          />
        )}
      </Stack>
      {renderForm()}
    </>
  );
};

export default WorkbinTableButtons;
