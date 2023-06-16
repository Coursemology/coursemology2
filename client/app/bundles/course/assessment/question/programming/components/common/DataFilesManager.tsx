import { ChangeEventHandler, useState } from 'react';
import {
  Controller,
  FieldArrayPath,
  useFieldArray,
  useFormContext,
} from 'react-hook-form';
import { Add } from '@mui/icons-material';
import {
  Alert,
  Button,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { ProgrammingFormData } from 'types/course/assessment/question/programming';

import TableContainer from 'lib/components/core/layouts/TableContainer';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../../translations';

import DataFileRow, { DraftableDataFile } from './DataFileRow';

interface DataFilesManagerProps {
  name: FieldArrayPath<ProgrammingFormData>;
  headless?: boolean;
  toolbarClassName?: string;
  disabled?: boolean;
}

interface DraftableDataFileWithId extends DraftableDataFile {
  /**
   * Same type as `FieldArrayWithId` in `react-hook-form`.
   */
  id: string;
}

interface DuplicatesAlertProps {
  of?: string[];
  onClose?: () => void;
  disabled?: boolean;
}

const DuplicatesAlert = (props: DuplicatesAlertProps): JSX.Element | null => {
  const { of: duplicates } = props;

  const { t } = useTranslation();

  if (!duplicates?.length) return null;

  if (duplicates.length === 1)
    return (
      <Alert
        componentsProps={{ closeButton: { disabled: props.disabled } }}
        onClose={props.onClose}
        severity="warning"
      >
        {t(translations.oneDuplicateFileNotAdded, { name: duplicates[0] })}
      </Alert>
    );

  return (
    <Alert
      componentsProps={{ closeButton: { disabled: props.disabled } }}
      onClose={props.onClose}
      severity="warning"
    >
      {t(translations.someDuplicateFilesNotAdded)}

      <ul className="m-0">
        {duplicates.map((filename) => (
          <li key={filename}>{filename}</li>
        ))}
      </ul>
    </Alert>
  );
};

const processFiles = <T,>(
  existingFiles: T[],
  fileList: FileList,
): [DraftableDataFile[], Set<string>] => {
  const existingFilesSet = existingFiles.reduce<Set<string>>(
    (set, file) => set.add((file as DraftableDataFileWithId).filename),
    new Set(),
  );

  const rejectedFiles = new Set<string>();

  const filesToAdd = Array.from(fileList).reduce<
    Record<string, DraftableDataFile>
  >((map, file) => {
    if (existingFilesSet.has(file.name) || map[file.name]) {
      rejectedFiles.add(file.name);
      delete map[file.name];
    } else {
      map[file.name] = {
        filename: file.name,
        size: file.size,
        hash: '',
        raw: file,
      };
    }

    return map;
  }, {});

  const sortedFiles = Object.values(filesToAdd).sort((a, b) =>
    a.filename.localeCompare(b.filename),
  );

  return [sortedFiles, rejectedFiles];
};

const DataFilesManager = (props: DataFilesManagerProps): JSX.Element => {
  const { t } = useTranslation();

  const { control } = useFormContext<ProgrammingFormData>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: props.name,
  });

  const [duplicates, setDuplicates] = useState<string[]>();

  const handleFileInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (props.disabled) return;

    e.preventDefault();

    const fileList = e.target.files;
    if (!fileList?.length) return;

    const [sortedFiles, rejectedFiles] = processFiles(fields, fileList);
    setDuplicates(rejectedFiles.size ? Array.from(rejectedFiles) : undefined);
    append(sortedFiles);

    e.target.value = '';
  };

  return (
    <section className="space-y-5">
      <div className={`space-y-5 ${props.toolbarClassName}`}>
        <Button
          disabled={props.disabled}
          size="small"
          startIcon={<Add />}
          variant="outlined"
        >
          {t(translations.addFiles)}

          <input
            className="absolute bottom-0 left-0 right-0 top-0 cursor-pointer opacity-0"
            disabled={props.disabled}
            multiple
            onChange={handleFileInputChange}
            type="file"
          />
        </Button>

        <DuplicatesAlert
          disabled={props.disabled}
          of={duplicates}
          onClose={(): void => setDuplicates(undefined)}
        />
      </div>

      {Boolean(fields.length) && (
        <TableContainer dense variant={props.headless ? 'bare' : 'outlined'}>
          <TableHead>
            <TableRow>
              <TableCell>{t(translations.fileName)}</TableCell>
              <TableCell>{t(translations.fileSize)}</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>

          <TableBody>
            {(fields as DraftableDataFileWithId[]).map((file, index) => (
              <Controller
                key={file.id}
                control={control}
                name={`${props.name}.${index}`}
                render={({ field }): JSX.Element => (
                  <DataFileRow
                    disabled={props.disabled}
                    of={field.value as DraftableDataFile}
                    onChange={field.onChange}
                    onDelete={(): void => remove(index)}
                  />
                )}
              />
            ))}
          </TableBody>
        </TableContainer>
      )}
    </section>
  );
};

export default DataFilesManager;
