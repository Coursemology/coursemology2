import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Add } from '@mui/icons-material';
import { Alert, Button, Paper, Typography } from '@mui/material';
import { produce } from 'immer';
import { SolutionEntity } from 'types/course/assessment/question/text-responses';

import { formatErrorMessage } from 'lib/components/form/fields/utils/mapError';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../translations';
import useDirty from '../../commons/useDirty';
import { SolutionsErrors } from '../commons/validations';

import Solution, { SolutionRef } from './Solution';

interface SolutionsManagerProps {
  for: SolutionEntity[];
  onDirtyChange: (isDirty: boolean) => void;
  isAssessmentAutograded: boolean;
  disabled?: boolean;
}

export interface SolutionsManagerRef {
  getSolutions: () => SolutionEntity[];
  reset: () => void;
  setErrors: (errors: SolutionsErrors) => void;
  resetErrors: () => void;
}

const SolutionsManager = forwardRef<SolutionsManagerRef, SolutionsManagerProps>(
  (props, ref): JSX.Element => {
    const { disabled, for: originalSolutions, isAssessmentAutograded } = props;
    const [solutions, setSolutions] = useState(originalSolutions);

    const solutionRefs = useRef<Record<SolutionEntity['id'], SolutionRef>>({});

    const { isDirty, mark, marker, reset } = useDirty<SolutionEntity['id']>();
    const [error, setError] = useState<string>();

    const { t } = useTranslation();

    const idToIndex = useMemo(
      () =>
        originalSolutions.reduce<Record<SolutionEntity['id'], number>>(
          (map, solution, index) => {
            map[solution.id] = index;
            return map;
          },
          {},
        ),
      [originalSolutions],
    );

    const resetErrors = (): void => {
      setError(undefined);
      solutions.forEach((solution) =>
        solutionRefs.current[solution.id].resetError(),
      );
    };

    useImperativeHandle(ref, () => ({
      getSolutions: () =>
        solutions.map((solution) =>
          solutionRefs.current[solution.id].getSolution(),
        ),
      reset: (): void => {
        solutions.forEach((solution) =>
          solutionRefs.current[solution.id].reset(),
        );
        setSolutions(originalSolutions);
        reset();
        resetErrors();
      },
      resetErrors,
      setErrors: (errors: SolutionsErrors): void => {
        setError(errors.error);

        Object.entries(errors.errors ?? {}).forEach(
          ([index, solutionError]) => {
            const id = solutions[index].id;
            solutionRefs.current[id]?.setError(solutionError);
          },
        );
      },
    }));

    const isOrderDirty = (currentSolutions: SolutionEntity[]): boolean => {
      if (currentSolutions.length !== originalSolutions.length) return true;

      return currentSolutions.some(
        (solution, index) => idToIndex[solution.id] !== index,
      );
    };

    useEffect(() => {
      props.onDirtyChange(isDirty || isOrderDirty(solutions));
    }, [isDirty, solutions]);

    const updateSolution = (updater: (draft: SolutionEntity[]) => void): void =>
      setSolutions(produce(updater));

    const addNewSolution = (): void => {
      const count = solutions.length;
      const id = `new-solution-${count}`;

      updateSolution((draft) => {
        draft.push({
          id,
          solution: '',
          solutionType: 'exact_match',
          grade: '',
          explanation: '',
          draft: true,
        });
      });

      mark(id, true);
    };

    const deleteDraftHandler =
      (index: number, id: SolutionEntity['id']) => () => {
        updateSolution((draft) => {
          draft.splice(index, 1);
        });

        mark(id, false);
      };

    return (
      <>
        {isAssessmentAutograded && (
          <Alert severity="info">{t(translations.textResponseNote)}</Alert>
        )}
        <Alert severity="info">{t(translations.solutionTypeExplanation)}</Alert>
        {error && (
          <Typography color="error" variant="body2">
            {formatErrorMessage(error)}
          </Typography>
        )}

        {Boolean(solutions?.length) && (
          <Paper variant="outlined">
            {solutions.map((solution, index) => (
              <Solution
                key={solution.id}
                ref={(solutionRef): void => {
                  if (solutionRef)
                    solutionRefs.current[solution.id] = solutionRef;
                }}
                disabled={disabled}
                for={solution}
                onDeleteDraft={deleteDraftHandler(index, solution.id)}
                onDirtyChange={marker(solution.id)}
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
  },
);

SolutionsManager.displayName = 'SolutionsManager';

export default SolutionsManager;
