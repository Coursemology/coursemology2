import { useState, CSSProperties } from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { Checkbox, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';

import DataTable from 'lib/components/DataTable';
import Toolbar from './Toolbar';
import InfoLabel from '../InfoLabel';
import t from './translations.intl';

import CourseAPI from 'api/course';
import { formatLongDateTime } from 'lib/moment';

export interface Material {
  id?: number;
  name?: string;
  updated_at?: string;
  deleting?: boolean;
}

interface FileManagerProps extends WrappedComponentProps {
  folderId: number;
  disabled?: boolean;
  materials?: Material[];
}

const styles: { [key: string]: CSSProperties } = {
  uploadingIndicator: {
    margin: '9px',
  },
};

const FileManager = (props: FileManagerProps): JSX.Element => {
  const { intl } = props;

  const [materials, setMaterials] = useState(props.materials ?? []);
  const [uploadingMaterials, setUploadingMaterials] = useState<Material[]>([]);

  const loadData = () => {
    const materialsData = materials?.map((file) => [
      file.name,
      formatLongDateTime(file.updated_at),
    ]);

    const uploadingMaterialsData = uploadingMaterials?.map((file) => [
      file.name,
      intl.formatMessage(t.uploadingFile),
    ]);

    return [...materialsData, ...uploadingMaterialsData];
  };

  /**
   * Remove materials from uploading list and add new materials from server response to existing
   * materials list.
   */
  const updateMaterials = (mat: Material[], response) => {
    setUploadingMaterials((uploadingMaterials) =>
      uploadingMaterials.filter((m) => mat.indexOf(m) === -1),
    );

    const newMaterials = response?.data?.materials;
    if (!newMaterials) return;
    setMaterials((materials) => materials.concat(newMaterials));
  };

  /**
   * Remove given materials from uploading list and display error message.
   */
  const removeUploads = (mat: Material[], response) => {
    const messageFromServer = response?.data?.errors;
    const failureMessage = intl.formatMessage(t.uploadFail);

    setUploadingMaterials((uploadingMaterials) =>
      uploadingMaterials.filter((m) => mat.indexOf(m) === -1),
    );

    toast.error(messageFromServer || failureMessage);
  };

  /**
   * Uploads the given files to the corresponding `folderId`.
   * @param files array of `File`s mapped from the file input in `Toolbar.tsx`
   */
  const uploadFiles = async (files: File[]) => {
    const { folderId } = props;

    const materials = files.map((file) => ({ name: file.name }));
    setUploadingMaterials((uploadingMaterials) =>
      uploadingMaterials.concat(materials),
    );

    try {
      const response = await CourseAPI.materialFolders.upload(folderId, files);
      updateMaterials(materials, response);
    } catch (error) {
      if (error instanceof AxiosError) removeUploads(materials, error.response);
    }
  };

  /**
   * Deletes a file on the `DataTable` asynchronously.
   * @param index row index of the file selected for deletion in the `DataTable`
   */
  const deleteFileWithRowIndex = async (index: number) => {
    const { id, name } = materials[index];

    setMaterials((materials) =>
      materials?.map((m) => (m.id === id ? { ...m, deleting: true } : m)),
    );

    try {
      await CourseAPI.materials.destroy(props.folderId, id);
      setMaterials((materials) => materials?.filter((m) => m.id !== id));
      toast.success(intl.formatMessage(t.deleteSuccess, { name }));
    } catch (error) {
      setMaterials((materials) =>
        materials?.map((m) => (m.id === id ? { ...m, deleting: false } : m)),
      );
      toast.error(intl.formatMessage(t.deleteFail, { name }));
    }
  };

  const ToolbarComponent = (props) => (
    <Toolbar
      {...props}
      onAddFiles={uploadFiles}
      onDeleteFileWithRowIndex={deleteFileWithRowIndex}
    />
  );

  const DisabledMessage = () => (
    <InfoLabel>{intl.formatMessage(t.disableNewFile)}</InfoLabel>
  );

  const renderTopTableComponent = () =>
    !props.disabled ? ToolbarComponent : DisabledMessage;

  const RowStartComponent = (props) => {
    const type = props['data-description'];
    const index = props['data-index'];

    const isBodyRow = type === 'row-select';
    const isUploadingMaterial = index >= materials.length;
    const isDeletingMaterial =
      index < materials.length && materials[index]?.deleting;

    if (isBodyRow && (isUploadingMaterial || isDeletingMaterial)) {
      return <CircularProgress size={24} sx={styles.uploadingIndicator} />;
    } else {
      return <Checkbox {...props} />;
    }
  };

  return (
    <DataTable
      data={loadData()}
      columns={[
        intl.formatMessage(t.fileName),
        intl.formatMessage(t.dateAdded),
      ]}
      options={{
        elevation: 0,
        pagination: false,
        selectableRows: !props.disabled ? 'multiple' : 'none',
        setTableProps: () => ({ size: 'small', sx: { overflow: 'hidden' } }),
      }}
      components={{
        Checkbox: RowStartComponent,
        TableToolbar: renderTopTableComponent(),
        TableToolbarSelect: renderTopTableComponent(),
        ...(materials.length <= 0
          ? {
              TableBody: () => null,
              TableHead: () => null,
            }
          : null),
      }}
    />
  );
};

export default injectIntl(FileManager);
