import { useFieldArray, useFormContext } from 'react-hook-form';
import { Add } from '@mui/icons-material';
import { Alert, Button, Paper } from '@mui/material';
import {
  SolutionEntity,
  TextResponseEditableFormData,
} from 'types/course/assessment/question/text-responses';

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

  const { control, watch } = useFormContext<TextResponseEditableFormData>();

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'solutions',
    keyName: '_key',
  });

  const addNewSolution = (): void => {
    append({
      id: `new-solution-${new Date().getTime()}`,
      solution: '',
      solutionType: 'exact_match',
      grade: '',
      explanation: '',
      draft: true,
    });
  };

  const getFieldData = (index: number): SolutionEntity => {
    const fieldData: SolutionEntity & { _key?: string } = { ...fields[index] };
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

  // "fields" is only updated when a solution is added or removed.
  // We require more eager watching of the "fields" array, such as when a solution is marked/unmarked for deletion.
  const eagerFields = watch('solutions') ?? [];
  const maximumPossibleGrade = eagerFields.reduce((maxGrade, field) => {
    if (field.toBeDeleted) return maxGrade;

    const grade = Number(field.grade);
    return Number.isNaN(grade) ? maxGrade : maxGrade + Math.max(grade, 0);
  }, 0);
  const numberOfFieldsToKeep = eagerFields.filter(
    (field) => !field.toBeDeleted,
  ).length;

  return (
    <>
      {isAssessmentAutograded && numberOfFieldsToKeep === 0 && (
        <Alert severity="info">{t(translations.noSolutionsNote)}</Alert>
      )}
      {numberOfFieldsToKeep > 0 && (
        <Alert severity="info">{t(translations.atLeastOneSolutionNote)}</Alert>
      )}
      {eagerFields.some((field) => field.solutionType === 'exact_match') &&
        eagerFields.some((field) => field.solutionType !== 'exact_match') && (
          <Alert severity="info">
            {t(translations.exactMatchSolutionNote)}
          </Alert>
        )}
      {maximumPossibleGrade > 0 &&
        maximumPossibleGrade > Number(watch('question.maximumGrade')) && (
          <Alert severity="info">
            {t(translations.solutionGradesExceedMaximumGradeNote)}
          </Alert>
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
