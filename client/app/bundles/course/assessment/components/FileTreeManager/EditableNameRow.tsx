import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { MessageDescriptor } from 'react-intl';
import { CreateNewFolder, InsertDriveFile } from '@mui/icons-material';
import { InputBase, Typography } from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';

import { RowLead } from './FileTreeRow';
import translations from './translations';
import { NameError } from './useFileTree';

export const NAME_ERROR_MESSAGES: Record<NameError, MessageDescriptor> = {
  invalid: translations.invalidPath,
  tooLong: translations.pathTooLong,
  duplicate: translations.duplicatePath,
  fileFolderClash: translations.fileFolderClash,
  folderAlreadyExists: translations.folderAlreadyExists,
};

interface EditableNameRowProps {
  kind: 'file' | 'folder';
  depth: number;
  label: string;
  initialName?: string;
  /** @returns The rule the name breaks, or `null` when it was accepted. */
  onSubmit: (name: string) => NameError | null;
  onCancel: () => void;
}

/**
 * An inline row for naming a new folder or renaming a draft file. Enter submits and Escape cancels;
 * leaving the field submits a name that was typed, or cancels an empty one.
 */
const EditableNameRow = (props: EditableNameRowProps): JSX.Element => {
  const { kind, depth, label, initialName = '', onSubmit, onCancel } = props;
  const { t } = useTranslation();

  const [name, setName] = useState(initialName);
  const [error, setError] = useState<NameError | null>(null);
  // Set once the row has finished, so a blur as it unmounts doesn't submit it again.
  const finished = useRef(false);
  const input = useRef<HTMLInputElement>(null);

  // The row opens because the user asked to name something, so it takes focus.
  useEffect(() => input.current?.focus(), []);

  const cancel = (): void => {
    finished.current = true;
    onCancel();
  };

  const submit = (): void => {
    if (finished.current) return;
    if (!name.trim()) {
      cancel();
      return;
    }

    const nameError = onSubmit(name);
    finished.current = nameError === null;
    setError(nameError);
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    // The tree handles keys for its rows; this field keeps its own.
    event.stopPropagation();

    if (event.key === 'Enter') {
      event.preventDefault();
      submit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      cancel();
    }
  };

  const Icon = kind === 'folder' ? CreateNewFolder : InsertDriveFile;
  const errorId = `file-tree-name-error-${depth}`;

  return (
    // Plain, unlike the selected row's tint: its icon and field already set it apart.
    <div className="flex items-start border-0 border-b border-solid border-neutral-100 bg-white py-2 pr-2">
      {/* The same lead as the rows, so the icon lines up with theirs. */}
      <RowLead depth={depth} />
      <span className="mr-2 flex h-7 flex-none items-center">
        <Icon className="text-neutral-500" fontSize="small" />
      </span>

      <div className="min-w-0 flex-1">
        <InputBase
          className="box-border h-7 w-full rounded-sm border border-solid border-primary px-2"
          inputProps={{
            'aria-describedby': error ? errorId : undefined,
            'aria-invalid': Boolean(error),
            'aria-label': label,
          }}
          inputRef={input}
          onBlur={submit}
          onChange={(event): void => {
            setName(event.target.value);
            setError(null);
          }}
          onFocus={(event): void => event.target.select()}
          onKeyDown={handleKeyDown}
          placeholder={
            kind === 'folder'
              ? t(translations.folderNamePlaceholder)
              : undefined
          }
          // The same size as the names in the rows.
          sx={{ typography: 'body2' }}
          value={name}
        />

        {/* About the name being typed, so it stays by the field rather than in a toast. */}
        {error && (
          <Typography
            className="mt-1 text-red-700"
            component="div"
            id={errorId}
            role="alert"
            variant="caption"
          >
            {t(NAME_ERROR_MESSAGES[error])}
          </Typography>
        )}
      </div>
    </div>
  );
};

export default EditableNameRow;
