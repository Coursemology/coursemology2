import { FC, useEffect, useRef, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { IconButton, Typography } from '@mui/material';
import {
  CellRandomConfig,
  TextResponseEditableFormData,
} from 'types/course/assessment/question/text-responses';

import Prompt from 'lib/components/core/dialogs/Prompt';
import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import FormDateTimePickerField from 'lib/components/form/fields/DateTimePickerField';
import FormSelectField from 'lib/components/form/fields/SelectField';
import { GridData } from 'lib/components/form/fields/SingleFileInput/types';
import { parseSpreadsheet } from 'lib/components/form/fields/SingleFileInput/utils';
import FormTextField from 'lib/components/form/fields/TextField';
import RandomizeIcon from 'lib/components/icons/RandomizeIcon';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

import translations from '../../../translations';

import SpreadsheetRandomizationManager from './SpreadsheetRandomizationManager';

interface Props {
  open: boolean;
  onClose: () => void;
  index: number;
  file?: File | null;
}

const SpreadsheetManagerPrompt: FC<Props> = ({
  open,
  onClose,
  index,
  file,
}) => {
  const { t } = useTranslation();

  const { control, watch, setValue } =
    useFormContext<TextResponseEditableFormData>();
  const spreadsheet = watch(`solutions.${index}.spreadsheet`);

  // Parse the (hydrated) spreadsheet file once here and share the result with
  // both the target-sheet dropdown and the randomization manager, so the file is
  // not parsed multiple times across the Advanced Options prompt.
  const [gridData, setGridData] = useState<GridData | null>(null);
  useEffect(() => {
    if (!file) {
      setGridData(null);
      return undefined;
    }
    let cancelled = false;
    parseSpreadsheet(file)
      .then((data) => {
        if (!cancelled) setGridData(data);
      })
      .catch(() => {
        if (!cancelled) setGridData(null);
      });
    return (): void => {
      cancelled = true;
    };
  }, [file]);
  const sheetNames = gridData?.sheetNames ?? [];

  // Incremented each time the dialog opens so SpreadsheetRandomizationManager
  // remounts and re-initialises from the latest saved variables.
  const [dialogKey, setDialogKey] = useState(0);
  useEffect(() => {
    if (open) setDialogKey((k) => k + 1);
  }, [open]);

  // Buffer variables changes made inside the dialog; commit to the form on close
  // so that the parent form only re-renders once and dirty-tracking is precise.
  const pendingVariablesRef = useRef<CellRandomConfig[] | null>(null);

  const handleClose = (): void => {
    if (pendingVariablesRef.current !== null) {
      setValue(
        `solutions.${index}.spreadsheet.variables`,
        pendingVariablesRef.current,
        { shouldDirty: true },
      );
      pendingVariablesRef.current = null;
    }
    onClose();
  };

  return (
    <Prompt
      cancelLabel={t(formTranslations.save)}
      maxWidth="lg"
      onClose={handleClose}
      open={open}
      title={t(translations.spreadsheetAdvancedOptions)}
    >
      <div className="flex flex-col space-y-4">
        <Controller
          control={control}
          name={`solutions.${index}.spreadsheet.isRandomSeedFixed`}
          render={({ field, fieldState }): JSX.Element => (
            <FormCheckboxField
              description={t(translations.fixedRandomSeedDescription)}
              field={field}
              fieldState={fieldState}
              label={t(translations.fixedRandomSeed)}
            />
          )}
        />
        <div className="flex items-center justify-start space-x-4">
          <Controller
            control={control}
            name={`solutions.${index}.spreadsheet.randomSeed`}
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                disabled={!spreadsheet?.isRandomSeedFixed}
                disableMargins
                field={field}
                fieldState={fieldState}
                size="small"
                type="number"
              />
            )}
          />
          <IconButton
            disabled={!spreadsheet?.isRandomSeedFixed}
            onClick={() => {
              const newSeed = Math.floor(Math.random() * 2_147_483_648);
              setValue(`solutions.${index}.spreadsheet.randomSeed`, newSeed);
            }}
          >
            <RandomizeIcon />
          </IconButton>
        </div>

        <Controller
          control={control}
          name={`solutions.${index}.spreadsheet.isTimestampFixed`}
          render={({ field, fieldState }): JSX.Element => (
            <FormCheckboxField
              description={t(translations.fixedTimestampDescription)}
              field={field}
              fieldState={fieldState}
              label={t(translations.fixedTimestamp)}
            />
          )}
        />
        <Controller
          control={control}
          name={`solutions.${index}.spreadsheet.testTimestamp`}
          render={({ field, fieldState }): JSX.Element => (
            <FormDateTimePickerField
              disabled={!spreadsheet?.isTimestampFixed}
              disableMargins
              field={field}
              fieldState={fieldState}
              timezone="UTC"
            />
          )}
        />
        <div className="flex flex-col">
          <Typography variant="body1">{t(translations.targetSheet)}</Typography>
          <Typography className="text-neutral-500" variant="body2">
            {t(translations.targetSheetDescription)}
          </Typography>
          <Controller
            control={control}
            name={`solutions.${index}.spreadsheet.targetSheetName`}
            render={({ field, fieldState }): JSX.Element => {
              const defaultSheet = sheetNames[0];
              // A null/empty value means "use the first sheet", so show the first
              // sheet as selected — that is what autograding actually resolves to.
              const current = field.value || defaultSheet || '';
              // Ensure a previously-saved sheet still displays even if it is not
              // among the parsed names (e.g. file not yet loaded, or renamed).
              const options = (
                current && !sheetNames.includes(current)
                  ? [current, ...sheetNames]
                  : sheetNames
              ).map((name) => ({ value: name, label: name }));
              return (
                <FormSelectField
                  disabled={sheetNames.length <= 1}
                  field={{
                    ...field,
                    value: current,
                    onChange: (e) =>
                      field.onChange(
                        e.target.value === defaultSheet ? null : e.target.value,
                      ),
                  }}
                  fieldState={fieldState}
                  options={options}
                  variant="outlined"
                />
              );
            }}
          />
        </div>

        <SpreadsheetRandomizationManager
          key={dialogKey}
          file={file ?? undefined}
          gridData={gridData}
          initialVariables={spreadsheet?.variables}
          onVariablesChange={(vars) => {
            pendingVariablesRef.current = vars;
          }}
        />
      </div>
    </Prompt>
  );
};

export default SpreadsheetManagerPrompt;
