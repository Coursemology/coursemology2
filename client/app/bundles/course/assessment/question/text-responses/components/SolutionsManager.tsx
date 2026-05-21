import { useFieldArray, useFormContext } from 'react-hook-form';
import { Add } from '@mui/icons-material';
import { Alert, Button, Paper, Typography } from '@mui/material';
import {
  SolutionEntity,
  TextResponseEditableFormData,
} from 'types/course/assessment/question/text-responses';

import { formatErrorMessage } from 'lib/components/form/fields/utils/mapError';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../translations';

import Solution from './Solution';

interface SolutionsManagerProps {
  isAssessmentAutograded: boolean;
  disabled?: boolean;
}

const SolutionsManager = ({
  isAssessmentAutograded,
  disabled,
}: SolutionsManagerProps): JSX.Element => {
  const { t } = useTranslation();

  const {
    control,
    formState: { errors },
  } = useFormContext<TextResponseEditableFormData>();

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'solutions',
    keyName: '_key',
  });

  const addNewSolution = (): void => {
    append({
      id: `new-solution-${fields.length}`,
      solution: '',
      solutionType: 'exact_match',
      grade: '',
      explanation: '',
      draft: true,
    });
  };

  const getFieldData = (index: number): SolutionEntity => {
    const fieldData: SolutionEntity & { _key?: string } = fields[index];
    delete fieldData._key;
    return fieldData;
  };

  const handleDelete = (index: number): void => {
    if ((fields[index] as SolutionEntity & { _key: string }).draft) {
      remove(index);
    } else {
      update(index, { ...getFieldData(index), toBeDeleted: true });
    }
  };

  const handleUndoDelete = (index: number): void => {
    update(index, { ...getFieldData(index), toBeDeleted: undefined });
  };

  const solutionsError = (errors.solutions as { message?: string } | undefined)
    ?.message;

  return (
    <>
      {isAssessmentAutograded && (
        <Alert severity="info">{t(translations.textResponseNote)}</Alert>
      )}
      <Alert severity="info">{t(translations.solutionTypeExplanation)}</Alert>
      {solutionsError && (
        <Typography color="error" variant="body2">
          {formatErrorMessage(solutionsError)}
        </Typography>
      )}

      {Boolean(fields.length) && (
        <Paper variant="outlined">
          {fields.map((field, index) => (
            <Solution
              key={field._key}
              disabled={disabled}
              index={index}
              onDelete={(): void => handleDelete(index)}
              onUndoDelete={(): void => handleUndoDelete(index)}
            />
          ))}
        </Paper>
      )}

      <Button
        disabled={disabled}
        onClick={addNewSolution}
        size="small"
        startIcon={<Add />}
        variant="outlined"
      >
        {t(translations.addSolution)}
      </Button>
    </>
  );
};

SolutionsManager.displayName = 'SolutionsManager';

export default SolutionsManager;
