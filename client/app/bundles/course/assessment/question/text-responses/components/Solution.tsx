import { ChangeEventHandler, forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Add, Delete, Undo } from '@mui/icons-material';
import { Button, IconButton, Select, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import FormHelperText from '@mui/material/FormHelperText';
import { produce } from 'immer';
import { ExistingSpreadsheet, NewSpreadsheet, SolutionEntity, SolutionType } from 'types/course/assessment/question/text-responses';

import CKEditorRichText from 'lib/components/core/fields/CKEditorRichText';
import TextField from 'lib/components/core/fields/TextField';
import { formatErrorMessage } from 'lib/components/form/fields/utils/mapError';
import useTranslation from 'lib/hooks/useTranslation';

import TableContainer from 'lib/components/core/layouts/TableContainer';
import translations from '../../../translations';
import useDirty from '../../commons/useDirty';
import { SolutionErrors } from '../commons/validations';
import { formatReadableBytes } from 'utilities';

interface SolutionProps {
  for: SolutionEntity;
  onDeleteDraft: () => void;
  onDirtyChange: (isDirty: boolean) => void;
  disabled?: boolean;
}

export interface SolutionRef {
  getSolution: () => SolutionEntity;
  reset: () => void;
  resetError: () => void;
  setError: (error: SolutionErrors) => void;
}

const ExistingSpreadsheetRow = ({ of, handleClickDelete, disabled }:
  { of: ExistingSpreadsheet; handleClickDelete: () => void; disabled?: boolean }): JSX.Element => {
  const { toBeDeleted, filename, size } = of;

  return (
    <TableRow
      className={`${
        toBeDeleted ? 'bg-neutral-200 line-through' : ''
      }`}
    >
      <TableCell className="break-all">{filename}</TableCell>

      <TableCell className="whitespace-nowrap">
        {formatReadableBytes(size, 2)}
      </TableCell>

      <TableCell>
        {toBeDeleted ? (
          <IconButton
            color="info"
            disabled={disabled}
            edge="end"
            onClick={handleClickDelete}
          >
            <Undo />
          </IconButton>
        ) : (
          <IconButton
            color="error"
            disabled={disabled}
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

const NewSpreadsheetRow = ({ of, handleClickDelete, disabled }:
  { of: NewSpreadsheet; handleClickDelete: () => void; disabled?: boolean }): JSX.Element => {
  const { raw } = of;
  
  return (
    <TableRow className="bg-lime-50">
      <TableCell className="break-all">{raw.name}</TableCell>

      <TableCell className="whitespace-nowrap">
        {formatReadableBytes(raw.size, 2)}
      </TableCell>

      <TableCell>
          <IconButton
            color="error"
            disabled={disabled}
            edge="end"
            onClick={handleClickDelete}
          >
            <Delete />
          </IconButton>
      </TableCell>
    </TableRow>
  );
};

const Solution = forwardRef<SolutionRef, SolutionProps>(
  (props, ref): JSX.Element => {
    const { disabled, for: originalSolution } = props;

    const [solution, setSolution] = useState(originalSolution);
    const [toBeDeleted, setToBeDeleted] = useState(false);
    const [error, setError] = useState<SolutionErrors>();

    const { isDirty, mark, reset } = useDirty<keyof SolutionEntity>();

    const { t } = useTranslation();

    useImperativeHandle(ref, () => ({
      getSolution: () => solution,
      reset: (): void => {
        setSolution(originalSolution);
        setToBeDeleted(false);
        reset();
      },
      setError,
      resetError: () => setError(undefined),
    }));

    useEffect(() => {
      props.onDirtyChange(isDirty);
    }, [isDirty]);

    const update = <T extends keyof SolutionEntity>(
      field: T,
      value: SolutionEntity[T],
    ): void => {
      setSolution(
        produce((draft) => {
          draft[field] = value;
        }),
      );

      mark(field, originalSolution[field] !== value);
    };

    const handleDelete = (): void => {
      if (!solution.draft) {
        update('toBeDeleted', true);
        setToBeDeleted(true);
      } else {
        props.onDeleteDraft();
      }
    };

    const undoDelete = (): void => {
      if (solution.draft) return;

      update('toBeDeleted', undefined);
      setToBeDeleted(false);
    };
    
    const handleFileInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
      if (props.disabled) return;

      const spreadsheets = solution.spreadsheets ? [...solution.spreadsheets] : [];
      if (e.target.files) {
        for (const file of e.target.files) {
          console.log({ file });
          spreadsheets.push({
            id: Date.now(), // Temporary ID for rendering, should be replaced with actual ID from backend after upload
            raw: file
          });
        }
      }
      update('spreadsheets', spreadsheets);
    };

    return (
      <section
        className={`flex border-0 border-b border-solid border-neutral-200 last:border-b-0 ${
          toBeDeleted ? 'border-neutral-300 bg-neutral-200' : ''
        } ${solution.draft ? 'bg-lime-50' : ''}`}
      >
        <div className="mx-8 mt-0 flex w-[calc(100%_-_84px)] flex-col space-y-4 py-4">
          <div className="flex flex-row space-x-4">
            <div className="flex w-2/4 flex-col space-y-2">
              <FormHelperText>{t(translations.solutionType)}</FormHelperText>
              <Select
                disabled={toBeDeleted || disabled}
                error={
                  error?.solutionType && formatErrorMessage(error.solutionType)
                }
                id="solution-type"
                name="solutionType"
                native
                onChange={(type): void => {
                  update(
                    'solutionType',
                    type.target.value as SolutionType,
                  )}
                }
                value={solution.solutionType}
                variant="outlined"
              >
                <option value="exact_match">
                  {t(translations.exactMatch)}
                </option>
                <option value="keyword">{t(translations.keyword)}</option>
                <option value="spreadsheet_formula">
                  {t(translations.spreadsheetFormula)}
                </option>
              </Select>
              {error?.solutionType && (
                <FormHelperText error={!!error?.solutionType}>
                  {formatErrorMessage(error.solutionType)}
                </FormHelperText>
              )}
            </div>

            <div className="flex w-2/4 flex-col space-y-2">
              <FormHelperText>{t(translations.grade)}</FormHelperText>
              <TextField
                disabled={toBeDeleted || disabled}
                error={error?.grade && formatErrorMessage(error.grade)}
                name="grade"
                onChange={(e): void => update('grade', e.target.value)}
                placeholder={t(translations.zeroGrade)}
                value={solution.grade}
              />
              {error?.grade && (
                <FormHelperText error={!!error?.grade}>
                  {formatErrorMessage(error.grade)}
                </FormHelperText>
              )}
            </div>
          </div>

          <div className="flex flex-row space-x-4">
            <div className="flex w-2/4 flex-col space-y-2">
              <FormHelperText>{t(translations.solution)}</FormHelperText>
              {/* <TextField
                disabled={toBeDeleted || disabled}
                error={error?.solution && formatErrorMessage(error.solution)}
                multiline
                name="solution"
                onChange={(e): void => update('solution', e.target.value)}
                rows={2}
                value={solution.solution}
              /> */}
              <textarea
                name="solution"
                onChange={(e): void => update('solution', e.target.value)}
                value={solution.solution || ''}
                className='h-full'
              />
              {error?.solution && (
                <FormHelperText error={!!error?.solution}>
                  {formatErrorMessage(error.solution)}
                </FormHelperText>
              )}
            </div>

            <div className="flex w-2/4 flex-col space-y-2">
              <FormHelperText>{t(translations.explanation)}</FormHelperText>
              {toBeDeleted ? (
                <Typography className="italic text-neutral-500" variant="body2">
                  {t(translations.solutionWillBeDeleted)}
                </Typography>
              ) : (
                <CKEditorRichText
                  disabled={toBeDeleted || disabled}
                  disableMargins
                  inputId={`solution-${solution.id}-explanation`}
                  name="explanation"
                  onChange={(explanation): void =>
                    update('explanation', explanation)
                  }
                  placeholder={t(translations.explanationDescription)}
                  value={solution.explanation ?? ''}
                />
              )}
            </div>
          </div>


            
          {solution.solutionType === 'spreadsheet_formula' && (
            <TableContainer dense variant='outlined'>
              <TableHead>
                <TableRow>
                  <TableCell className="flex items-center space-x-2">
                    <p>Test spreadsheets</p>

          <Button
            disabled={props.disabled}
            size="small"
            startIcon={<Add />}
            variant="outlined"
          >
            {t(translations.addFiles)}

            <input
              className="absolute bottom-0 left-0 right-0 top-0 opacity-0 cursor-pointer"
              disabled={props.disabled}
              multiple
              onChange={handleFileInputChange}
            type="file"
            accept='.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.ods,application/vnd.oasis.opendocument.spreadsheet'
          />
            </Button>

                  </TableCell>
                  <TableCell>{t(translations.fileSize)}</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
    
              <TableBody>
                {(solution.spreadsheets ?? []).map((sheet) => {
                  if ('raw' in sheet) {
                    return <NewSpreadsheetRow
                      key={sheet.id}
                      of={sheet}
                      handleClickDelete={() => {
                        const spreadsheets = solution.spreadsheets?.filter(s => s.id !== sheet.id);
                        update('spreadsheets', spreadsheets);
  }}/>
} else {
                    return <ExistingSpreadsheetRow
                      key={sheet.id}
                      of={sheet}
                      handleClickDelete={() => {
                        const spreadsheets = solution.spreadsheets?.map(s => s.id === sheet.id ? { ...s, toBeDeleted: !(s as ExistingSpreadsheet).toBeDeleted } : s);
                        update('spreadsheets', spreadsheets);
                      }}
                    />
                  }
                })}
              </TableBody>
              {solution.spreadsheets?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center bg-neutral-100 text-neutral-500">
                    Add at least one spreadsheet to autograde the formula solution.
                  </TableCell>
                </TableRow>
)}
            </TableContainer>
          )}
          {solution.draft && (
            <Typography className="italic text-neutral-500" variant="body2">
              {t(translations.newSolutionCannotUndo)}
            </Typography>
          )}
        </div>

        <div className="py-4">
          {toBeDeleted ? (
            <Tooltip title={t(translations.undoDeleteSolution)}>
              <IconButton
                color="error"
                disabled={disabled}
                onClick={undoDelete}
              >
                <Undo />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title={t(translations.deleteSolution)}>
              <IconButton
                color="error"
                disabled={disabled}
                onClick={handleDelete}
              >
                <Undo />
              </IconButton>
            </Tooltip>
          )}
        </div>
      </section>
    );
  },
);

Solution.displayName = 'Solution';

export default Solution;
