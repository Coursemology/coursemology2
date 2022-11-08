import { FC, ReactElement, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';

import { AppDispatch, AppState } from 'types/store';

import { Breadcrumbs, Paper } from '@mui/material';
import { grey } from '@mui/material/colors';

import EditButton from 'lib/components/core/buttons/EditButton';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import PageHeader from 'lib/components/navigation/PageHeader';
import { getWorkbinFolderURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import useTranslation from 'lib/hooks/useTranslation';

import { loadFolder } from '../../operations';
import {
  getBreadcrumbs,
  getCurrFolderInfo,
  getFolderMaterials,
  getFolderPermissions,
  getFolderSubfolders,
} from '../../selectors';

import WorkbinTable from '../../components/tables/WorkbinTable';
import NewSubfolderButton from '../../components/buttons/NewSubfolderButton';
import UploadFilesButton from '../../components/buttons/UploadFilesButton';
import DownloadFolderButton from '../../components/buttons/DownloadFolderButton';
import MaterialUpload from '../../components/misc/MaterialUpload';

import FolderNew from '../FolderNew';
import FolderEdit from '../FolderEdit';

const translations = defineMessages({
  defaultHeader: {
    id: 'course.materials.folders.defaultHeader',
    defaultMessage: 'Materials',
  },
});

const FolderShow: FC = () => {
  const { folderId } = useParams();
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  // For new folder form dialog
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  // For edit folder form dialog
  const [isEditFolderOpen, setIsEditFolderOpen] = useState(false);
  // For material upload form dialog
  const [isMaterialUploadOpen, setIsMaterialUploadOpen] = useState(false);

  const subfolders = useSelector((state: AppState) =>
    getFolderSubfolders(state),
  );
  const materials = useSelector((state: AppState) => getFolderMaterials(state));
  const currFolderInfo = useSelector((state: AppState) =>
    getCurrFolderInfo(state),
  );
  const breadcrumbs = useSelector((state: AppState) => getBreadcrumbs(state));
  const permissions = useSelector((state: AppState) =>
    getFolderPermissions(state),
  );

  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (folderId) {
      dispatch(loadFolder(+folderId)).finally(() => setIsLoading(false));
    }
  }, [dispatch, folderId]);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  const headerToolbars: ReactElement[] = [];

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
        id="edit-folder-button"
        key="edit-folder-button"
        onClick={(): void => setIsEditFolderOpen(true)}
        style={{ padding: 6 }}
        color="default"
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
    <>
      <Paper
        variant="outlined"
        sx={{
          marginBottom: '4px',
          padding: '4px 8px',
          backgroundColor: grey[100],
          border: '0',
        }}
      >
        <Breadcrumbs>
          {breadcrumbs.map((breadcrumb, index) => {
            if (index === breadcrumbs.length - 1) {
              return (
                <span key={`folder-breadcrumb-${breadcrumb.id}`}>
                  {breadcrumb.name}
                </span>
              );
            }
            return (
              <Link
                key={`folder-breadcrumb-${breadcrumb.id}`}
                to={`/courses/${getCourseId()}/materials/folders/${
                  breadcrumb.id
                }/`}
              >
                {breadcrumb.name}
              </Link>
            );
          })}
        </Breadcrumbs>
      </Paper>
      <PageHeader
        key={`workbin-folder-${currFolderInfo.name}-${currFolderInfo.id}`}
        title={
          currFolderInfo.name === null
            ? t(translations.defaultHeader)
            : currFolderInfo.name
        }
        toolbars={headerToolbars}
        returnLink={
          currFolderInfo.parentId !== null
            ? getWorkbinFolderURL(getCourseId(), currFolderInfo.parentId)
            : undefined
        }
      />
      <WorkbinTable
        key={currFolderInfo.id}
        currFolderId={currFolderInfo.id}
        subfolders={subfolders}
        materials={materials}
        canEditSubfolders={permissions.canEditSubfolders}
        isCurrentCourseStudent={permissions.isCurrentCourseStudent}
        isConcrete={currFolderInfo.isConcrete}
      />

      <FolderNew
        folderId={+folderId!}
        isOpen={isNewFolderOpen}
        onClose={(): void => setIsNewFolderOpen(false)}
      />
      <FolderEdit
        isOpen={isEditFolderOpen}
        onClose={(): void => {
          setIsEditFolderOpen(false);
        }}
        folderId={currFolderInfo.id}
        initialValues={folderInitialValues}
      />
      <MaterialUpload
        isOpen={isMaterialUploadOpen}
        handleClose={(): void => setIsMaterialUploadOpen(false)}
        currFolderId={currFolderInfo.id}
      />
    </>
  );
};

export default FolderShow;
