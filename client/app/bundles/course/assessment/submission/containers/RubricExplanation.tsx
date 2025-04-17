import { Dispatch, FC, SetStateAction } from 'react';
import { MenuItem, Select, Typography } from '@mui/material';
import { CategoryScoreData } from 'types/course/assessment/question/rubric-based-responses';
import { SubmissionCategoryData } from 'types/course/assessment/submission/question/types';

import TextField from 'lib/components/core/fields/TextField';
import { FIELD_LONG_DEBOUNCE_DELAY_MS } from 'lib/constants/sharedConstants';
import { useDebounce } from 'lib/hooks/useDebounce';

import { updateExplanation } from '../actions/answers/rubricBasedResponse';

interface RubricExplanationProps {
  answerId: number;
  category: SubmissionCategoryData;
  categoryScores: Record<number, CategoryScoreData>;
  setCategoryScores: Dispatch<
    SetStateAction<Record<number, CategoryScoreData>>
  >;
  setIsFirstRendering: (isFirstRendering: boolean) => void;
}

const RubricExplanation: FC<RubricExplanationProps> = (props) => {
  const {
    answerId,
    category,
    categoryScores,
    setCategoryScores,
    setIsFirstRendering,
  } = props;

  const handleUpdateExplanation = (
    id: number,
    explanation: string,
  ): Promise<void> => {
    return updateExplanation(answerId, id, explanation);
  };

  const debouncedUpdateExplanation = useDebounce(
    handleUpdateExplanation,
    FIELD_LONG_DEBOUNCE_DELAY_MS,
    [],
  );

  const handleOnChange = (event): void => {
    const newExplanation = event.target.value;
    setCategoryScores((prevScores) => ({
      ...prevScores,
      [category.id]: {
        ...prevScores[category.id],
        explanation: newExplanation,
      },
    }));
    setIsFirstRendering(false);

    debouncedUpdateExplanation(categoryScores[category.id].id, newExplanation);
  };

  if (category.isBonusCategory) {
    return (
      <TextField
        className="w-full max-h-24 max-w-3xl"
        id={`category-${category.id}`}
        onChange={handleOnChange}
        value={categoryScores[category.id].explanation}
        variant="outlined"
      />
    );
  }

  return (
    <Select
      className="w-full max-h-24 max-w-3xl"
      id={`category-${category.id}`}
      onChange={handleOnChange}
      value={categoryScores[category.id].score}
      variant="outlined"
    >
      {category.levels.map((level) => (
        <MenuItem key={level.id} value={level.level}>
          <Typography
            dangerouslySetInnerHTML={{
              __html: level.explanation,
            }}
            variant="body2"
          />
        </MenuItem>
      ))}
    </Select>
  );
};

export default RubricExplanation;
