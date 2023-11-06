import { CSSProperties, useState } from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { Checkbox, CircularProgress } from '@mui/material';
import { AxiosError } from 'axios';

import CourseAPI from 'api/course';
import InfoLabel from 'lib/components/core/InfoLabel';
import DataTable from 'lib/components/core/layouts/DataTable';
import Link from 'lib/components/core/Link';
import { getWorkbinFileURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import toast from 'lib/hooks/toast';
import { formatLongDateTime } from 'lib/moment';

import Toolbar from './Toolbar';
import t from './translations.intl';

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
  const { disabled, intl } = props;

  const [materials, setMaterials] = useState(props.materials ?? []);
  const [uploadingMaterials, setUploadingMaterials] = useState<Material[]>([]);

  const loadData = (): (string | undefined)[][] => {
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
  const updateMaterials = (mat: Material[], response): void => {
    setUploadingMaterials((current) =>
      current.filter((m) => mat.indexOf(m) === -1),
    );

    const newMaterials = response?.data?.materials;
    if (!newMaterials) return;
    setMaterials((current) => current.concat(newMaterials));
  };

  /**
   * Remove given materials from uploading list and display error message.
   */
  const removeUploads = (mat: Material[], response): void => {
    const messageFromServer = response?.data?.errors;
    const failureMessage = intl.formatMessage(t.uploadFail);

    setUploadingMaterials((current) =>
      current.filter((m) => mat.indexOf(m) === -1),
    );

    toast.error(messageFromServer || failureMessage);
  };

  /**
   * Uploads the given files to the corresponding `folderId`.
   * @param files array of `File`s mapped from the file input in `Toolbar.tsx`
   */
  const uploadFiles = async (files: File[]): Promise<void> => {
    const { folderId } = props;

    const newMaterials = files.map((file) => ({ name: file.name }));
    setUploadingMaterials((current) => current.concat(newMaterials));

    try {
      const response = await CourseAPI.materialFolders.upload(folderId, files);
      updateMaterials(newMaterials, response);
    } catch (error) {
      if (error instanceof AxiosError)
        removeUploads(newMaterials, error.response);
    }
  };

  /**
   * Deletes a file on the `DataTable` asynchronously.
   * @param index row index of the file selected for deletion in the `DataTable`
   */
  const deleteFileWithRowIndex = async (index: number): Promise<void> => {
    const { id, name } = materials[index];
    if (!id || !name) return;

    setMaterials(
      (current) =>
        current?.map((m) => (m.id === id ? { ...m, deleting: true } : m)),
    );

    try {
      await CourseAPI.materials.destroy(props.folderId, id);
      setMaterials((current) => current?.filter((m) => m.id !== id));
      toast.success(intl.formatMessage(t.deleteSuccess, { name }));
    } catch (error) {
      setMaterials(
        (current) =>
          current?.map((m) => (m.id === id ? { ...m, deleting: false } : m)),
      );
      toast.error(intl.formatMessage(t.deleteFail, { name }));
    }
  };

  const ToolbarComponent = (toolbarProps): JSX.Element => (
    <Toolbar
      {...toolbarProps}
      onAddFiles={uploadFiles}
      onDeleteFileWithRowIndex={deleteFileWithRowIndex}
    />
  );

  const DisabledMessages = injectIntl(
    (messagesProps): JSX.Element => (
      <>
        <InfoLabel label={messagesProps.intl.formatMessage(t.disableNewFile)} />

        {materials.length > 0 && (
          <InfoLabel
            label={messagesProps.intl.formatMessage(t.studentCannotSeeFiles)}
            marginTop={1}
            warning
          />
        )}
      </>
    ),
  );

  const RowStartComponent = (rowStartProps): JSX.Element => {
    const type = rowStartProps['data-description'];
    const index = rowStartProps['data-index'];

    const isBodyRow = type === 'row-select';
    const isUploadingMaterial = index >= materials.length;
    const isDeletingMaterial =
      index < materials.length && materials[index]?.deleting;

    if (isBodyRow && (isUploadingMaterial || isDeletingMaterial)) {
      return <CircularProgress size={24} sx={styles.uploadingIndicator} />;
    }

    return <Checkbox {...rowStartProps} />;
  };

  const renderFileNameRowContent = (
    value: string,
    { rowIndex },
  ): string | JSX.Element => {
    if (rowIndex >= materials.length) return value;

    const material = materials[rowIndex];
    if (!material) return value;

    const url = getWorkbinFileURL(getCourseId(), props.folderId, material.id);

    return (
      <Link href={url} opensInNewTab>
        {value}
      </Link>
    );
  };

  return (
    <DataTable
      columns={[
        {
          name: intl.formatMessage(t.fileName),
          options: { customBodyRender: renderFileNameRowContent },
        },
        intl.formatMessage(t.dateAdded),
      ]}
      components={{
        Checkbox: RowStartComponent,
        TableToolbar: !disabled ? ToolbarComponent : DisabledMessages,
        TableToolbarSelect: !disabled ? ToolbarComponent : DisabledMessages,
        ...(materials.length === 0
          ? {
              TableBody: () => null,
              TableHead: () => null,
            }
          : null),
      }}
      data={loadData()}
      options={{
        elevation: 0,
        pagination: false,
        selectableRows: !disabled ? 'multiple' : 'none',
        setTableProps: () => ({ size: 'small', sx: { overflow: 'hidden' } }),
        fixedHeader: false,
      }}
    />
  );
};

export default injectIntl(FileManager);
