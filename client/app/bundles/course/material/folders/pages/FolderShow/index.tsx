import { FC, ReactElement, useEffect, useState } from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { AppDispatch, AppState } from 'types/store';

import LoadingIndicator from 'lib/components/LoadingIndicator';
import PageHeader from 'lib/components/pages/PageHeader';
import { getWorkbinFolderURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';

import { loadFolder } from '../../operations';
import {
  getFolderCanStudentUpload,
  getFolderDescription,
  getFolderEndAt,
  getFolderId,
  getFolderMaterials,
  getFolderName,
  getFolderParentId,
  getFolderPermissions,
  getFolderStartAt,
  getFolderSubfolders,
} from '../../selectors';

import WorkbinTable from '../../components/tables/WorkbinTable';
import NewSubfolderButton from '../../components/buttons/NewSubfolderButton';
import UploadFilesButton from '../../components/buttons/UploadFilesButton';
import DownloadFolderButton from '../../components/buttons/DownloadFolderButton';
import EditFolderButton from '../../components/buttons/EditFolderButton';
import MaterialUpload from '../../components/misc/MaterialUpload';

import FolderNew from '../FolderNew';
import FolderEdit from '../FolderEdit';

interface Props extends WrappedComponentProps {}

const FolderShow: FC<Props> = (_props) => {
  const { folderId } = useParams();
  const dispatch = useDispatch<AppDispatch>();

  // For new folder form dialog
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  // For edit folder form dialog
  const [isEditFolderOpen, setIsEditFolderOpen] = useState(false);
  // For material upload form dialog
  const [isMaterialUploadOpen, setIsMaterialUploadOpen] = useState(false);

  const id = useSelector((state: AppState) => getFolderId(state));
  const parentId = useSelector((state: AppState) => getFolderParentId(state));
  const name = useSelector((state: AppState) => getFolderName(state));
  const description = useSelector((state: AppState) =>
    getFolderDescription(state),
  );
  const canStudentUpload = useSelector((state: AppState) =>
    getFolderCanStudentUpload(state),
  );
  const startAt = useSelector((state: AppState) => getFolderStartAt(state));
  const endAt = useSelector((state: AppState) => getFolderEndAt(state));
  const subfolders = useSelector((state: AppState) =>
    getFolderSubfolders(state),
  );
  const materials = useSelector((state: AppState) => getFolderMaterials(state));
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

  if (permissions.isConcrete && permissions.canCreateSubfolder) {
    headerToolbars.push(
      <NewSubfolderButton
        key="new-folder-button"
        handleOnClick={(): void => {
          setIsNewFolderOpen(true);
        }}
      />,
    );
  }
  if (permissions.isConcrete && permissions.canUpload) {
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
    <DownloadFolderButton key="download-folder-button" currFolderId={id} />,
  );
  if (permissions.isConcrete && permissions.canEdit) {
    headerToolbars.push(
      <EditFolderButton
        key="edit-folder-button"
        handleOnClick={(): void => setIsEditFolderOpen(true)}
      />,
    );
  }

  const folderInitialValues = {
    name,
    description,
    canStudentUpload,
    startAt: new Date(startAt),
    endAt: endAt !== null ? new Date(endAt) : null,
  };

  return (
    <>
      <PageHeader
        key={`workbin-folder-${name}-${id}`}
        title={name}
        toolbars={headerToolbars}
        returnLink={
          parentId !== null
            ? getWorkbinFolderURL(getCourseId(), parentId)
            : undefined
        }
      />
      <WorkbinTable
        currFolderId={id}
        subfolders={subfolders}
        materials={materials}
        isCurrentCourseStudent={permissions.isCurrentCourseStudent}
        isConcrete={permissions.isConcrete}
      />
      <FolderNew
        folderId={+folderId!}
        isOpen={isNewFolderOpen}
        handleClose={(): void => setIsNewFolderOpen(false)}
      />
      <FolderEdit
        isOpen={isEditFolderOpen}
        handleClose={(): void => {
          setIsEditFolderOpen(false);
        }}
        folderId={id}
        initialValues={folderInitialValues}
      />
      <MaterialUpload
        isOpen={isMaterialUploadOpen}
        handleClose={(): void => setIsMaterialUploadOpen(false)}
        currFolderId={id}
      />
    </>
  );
};

export default injectIntl(FolderShow);
