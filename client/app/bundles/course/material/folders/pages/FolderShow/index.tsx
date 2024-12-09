import { FC, ReactElement, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useParams } from 'react-router-dom';
import { getIdFromUnknown } from 'utilities';

import EditButton from 'lib/components/core/buttons/EditButton';
import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { getWorkbinFolderURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import DownloadFolderButton from '../../components/buttons/DownloadFolderButton';
import NewSubfolderButton from '../../components/buttons/NewSubfolderButton';
import UploadFilesButton from '../../components/buttons/UploadFilesButton';
import MaterialUpload from '../../components/misc/MaterialUpload';
import WorkbinTable from '../../components/tables/WorkbinTable';
import { loadFolder } from '../../operations';
import {
  getCurrFolderInfo,
  getFolderMaterials,
  getFolderPermissions,
  getFolderSubfolders,
} from '../../selectors';
import ErrorRetrievingFolderPage from '../ErrorRetrievingFolderPage';
import FolderEdit from '../FolderEdit';
import FolderNew from '../FolderNew';

const translations = defineMessages({
  defaultHeader: {
    id: 'course.material.folders.FolderShow.defaultHeader',
    defaultMessage: 'Materials',
  },
});

const FolderShow: FC = () => {
  const { folderId } = useParams();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  // For new folder form dialog
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  // For edit folder form dialog
  const [isEditFolderOpen, setIsEditFolderOpen] = useState(false);
  // For material upload form dialog
  const [isMaterialUploadOpen, setIsMaterialUploadOpen] = useState(false);

  const subfolders = useAppSelector(getFolderSubfolders);
  const materials = useAppSelector(getFolderMaterials);
  const currFolderInfo = useAppSelector(getCurrFolderInfo);
  const permissions = useAppSelector(getFolderPermissions);

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  useEffect(() => {
    setIsError(false);
    dispatch(loadFolder(getIdFromUnknown(folderId)))
      .catch(() => setIsError(true))
      .finally(() => setIsLoading(false));
  }, [dispatch, folderId]);

  if (isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorRetrievingFolderPage />;

  const headerToolbars: ReactElement[] = [];

  if (folderId === undefined) {
    const rootFolderId = currFolderInfo.id;
    window.history.replaceState(
      {},
      '',
      getWorkbinFolderURL(getCourseId(), rootFolderId),
    );
  }

  if (currFolderInfo.isConcrete && permissions.canCreateSubfolder) {
    headerToolbars.push(
      <NewSubfolderButton
        key="new-folder-button"
        handleOnClick={(): void => {
          setIsNewFolderOpen(true);
        }}
      />,
    );
  }
  if (currFolderInfo.isConcrete && permissions.canUpload) {
    headerToolbars.push(
      <UploadFilesButton
        key="upload-files-button"
        handleOnClick={(): void => {
          setIsMaterialUploadOpen(true);
        }}
      />,
    );
  }
  headerToolbars.push(
    <DownloadFolderButton
      key="download-folder-button"
      currFolderId={currFolderInfo.id}
    />,
  );
  if (currFolderInfo.isConcrete && permissions.canEdit) {
    headerToolbars.push(
      <EditButton
        key="edit-folder-button"
        color="default"
        id="edit-folder-button"
        onClick={(): void => setIsEditFolderOpen(true)}
        style={{ padding: 6 }}
      />,
    );
  }

  const folderInitialValues = {
    name: currFolderInfo.name,
    description: currFolderInfo.description,
    canStudentUpload: permissions.canStudentUpload,
    startAt: new Date(currFolderInfo.startAt),
    endAt:
      currFolderInfo.endAt !== null ? new Date(currFolderInfo.endAt) : null,
  };

  return (
    <Page
      actions={headerToolbars}
      backTo={
        currFolderInfo.parentId !== null
          ? getWorkbinFolderURL(getCourseId(), currFolderInfo.parentId)
          : undefined
      }
      title={currFolderInfo.name ?? t(translations.defaultHeader)}
      unpadded
    >
      <WorkbinTable
        key={currFolderInfo.id}
        canManageKnowledgeBase={permissions.canManageKnowledgeBase}
        currFolderId={currFolderInfo.id}
        isConcrete={currFolderInfo.isConcrete}
        isCurrentCourseStudent={permissions.isCurrentCourseStudent}
        materials={materials}
        subfolders={subfolders}
      />

      <FolderNew
        folderId={+folderId!}
        isOpen={isNewFolderOpen}
        onClose={(): void => setIsNewFolderOpen(false)}
      />
      <FolderEdit
        folderId={currFolderInfo.id}
        initialValues={folderInitialValues}
        isOpen={isEditFolderOpen}
        onClose={(): void => {
          setIsEditFolderOpen(false);
        }}
      />
      <MaterialUpload
        currFolderId={currFolderInfo.id}
        handleClose={(): void => setIsMaterialUploadOpen(false)}
        isOpen={isMaterialUploadOpen}
      />
    </Page>
  );
};

export default FolderShow;
