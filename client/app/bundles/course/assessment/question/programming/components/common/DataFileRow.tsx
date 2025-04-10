import { Delete, Undo } from '@mui/icons-material';
import { IconButton, TableCell, TableRow } from '@mui/material';
import { DataFile } from 'types/course/assessment/question/programming';
import { formatReadableBytes } from 'utilities';

type Marked<T> = [T];
type MaybeMarked<T> = T | Marked<T>;

const mark = <T,>(thing: T): Marked<T> => [thing];

const unmark = <T,>(markedThing: Marked<T>): T => markedThing[0];

export const isMarked = <T,>(thing: MaybeMarked<T>): thing is Marked<T> =>
  Array.isArray(thing);

export const unwrap = <T,>(thing: MaybeMarked<T>): T =>
  isMarked(thing) ? thing[0] : thing;

export interface DraftableDataFile extends DataFile {
  raw?: File;
}

export const isDraftable = (
  file: DataFile | DraftableDataFile,
): file is DraftableDataFile => 'raw' in file;

interface DataFileRowProps {
  of: MaybeMarked<DraftableDataFile>;
  onChange?: (file: MaybeMarked<DraftableDataFile>) => void;
  onDelete?: () => void;
  disabled?: boolean;
}

const DataFileRow = (props: DataFileRowProps): JSX.Element => {
  const file = unwrap(props.of);
  const toBeDeleted = isMarked(props.of);

  const handleClickDelete = (): void => {
    if (file.raw) {
      props.onDelete?.();
    } else {
      if (toBeDeleted) return;

      // TypeScript's type narrowing cannot handle the fact that `toBeDeleted`
      // is a return value of a type guard, so we need to type-assert here.
      props.onChange?.(mark(props.of as DraftableDataFile));
    }
  };

  const handleClickUndoDelete = (): void => {
    if (!toBeDeleted) return;

    props.onChange?.(unmark(props.of as Marked<DraftableDataFile>));
  };

  return (
    <TableRow
      className={`${file.raw ? 'bg-lime-50' : ''} ${
        toBeDeleted ? 'bg-neutral-200 line-through' : ''
      }`}
    >
      <TableCell className="break-all">{file.filename}</TableCell>

      <TableCell className="whitespace-nowrap">
        {formatReadableBytes(file.size, 2)}
      </TableCell>

      <TableCell>
        {toBeDeleted ? (
          <IconButton
            color="info"
            disabled={props.disabled}
            edge="end"
            onClick={handleClickUndoDelete}
          >
            <Undo />
          </IconButton>
        ) : (
          <IconButton
            color="error"
            disabled={props.disabled}
            edge="end"
            onClick={handleClickDelete}
          >
            <Delete />
          </IconButton>
        )}
      </TableCell>
    </TableRow>
  );
};

export default DataFileRow;
