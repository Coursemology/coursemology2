import { FC, ReactElement, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';

import { AppDispatch, AppState } from 'types/store';

import { Breadcrumbs } from '@mui/material';

import LoadingIndicator from 'lib/components/LoadingIndicator';
import PageHeader from 'lib/components/pages/PageHeader';
import { getWorkbinFolderURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';

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
import EditFolderButton from '../../components/buttons/EditFolderButton';
import MaterialUpload from '../../components/misc/MaterialUpload';

import FolderNew from '../FolderNew';
import FolderEdit from '../FolderEdit';

interface Props extends WrappedComponentProps {}

const translations = defineMessages({
  defaultHeader: {
    id: 'course.materials.folders.defaultHeader',
    defaultMessage: 'Materials',
  },
});

const FolderShow: FC<Props> = (props) => {
  const { intl } = props;
  const { folderId } = useParams();
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
      <EditFolderButton
        key="edit-folder-button"
        handleOnClick={(): void => setIsEditFolderOpen(true)}
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
      <Breadcrumbs>
        {breadcrumbs.map((breadcrumb) => {
          return (
            <Link
              key={`folder-breadcrumb-${breadcrumb.id}`}
              to={`/courses/${getCourseId()}/materials/folders/${
                breadcrumb.id
              }/`}
            >
              {breadcrumb.name === 'Root' ? '~' : breadcrumb.name}
            </Link>
          );
        })}
      </Breadcrumbs>
      <PageHeader
        key={`workbin-folder-${currFolderInfo.name}-${currFolderInfo.id}`}
        title={
          currFolderInfo.name === null
            ? intl.formatMessage(translations.defaultHeader)
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
        currFolderId={currFolderInfo.id}
        subfolders={subfolders}
        materials={materials}
        isCurrentCourseStudent={permissions.isCurrentCourseStudent}
        isConcrete={currFolderInfo.isConcrete}
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

export default injectIntl(FolderShow);
