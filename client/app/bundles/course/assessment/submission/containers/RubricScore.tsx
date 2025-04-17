import { Dispatch, FC, SetStateAction } from 'react';
import { MenuItem, Select } from '@mui/material';
import { CategoryScoreData } from 'types/course/assessment/question/rubric-based-responses';
import { SubmissionCategoryData } from 'types/course/assessment/submission/question/types';

import TextField from 'lib/components/core/fields/TextField';
import { FIELD_LONG_DEBOUNCE_DELAY_MS } from 'lib/constants/sharedConstants';
import { useDebounce } from 'lib/hooks/useDebounce';

import { updateScore } from '../actions/answers/rubricBasedResponse';

interface RubricScoreProps {
  answerId: number;
  category: SubmissionCategoryData;
  categoryScores: Record<number, CategoryScoreData>;
  setCategoryScores: Dispatch<
    SetStateAction<Record<number, CategoryScoreData>>
  >;
  setIsFirstRendering: (isFirstRendering: boolean) => void;
}

const RubricScore: FC<RubricScoreProps> = (props) => {
  const {
    answerId,
    category,
    categoryScores,
    setCategoryScores,
    setIsFirstRendering,
  } = props;

  const handleUpdateScore = (id: number, newScore: number): Promise<void> => {
    return updateScore(answerId, id, newScore);
  };

  const debouncedUpdateScore = useDebounce(
    handleUpdateScore,
    FIELD_LONG_DEBOUNCE_DELAY_MS,
    [],
  );

  const handleOnChange = (event): void => {
    const selectedScore = Number(event.target.value);
    setCategoryScores((prevScores) => ({
      ...prevScores,
      [category.id]: {
        ...prevScores[category.id],
        score: selectedScore,
      },
    }));
    setIsFirstRendering(false);

    debouncedUpdateScore(categoryScores[category.id].id, Number(selectedScore));
  };

  if (category.isBonusCategory) {
    return (
      <TextField
        className="w-full max-h-24 max-w-3xl"
        id={`category-${category.id}`}
        onChange={handleOnChange}
        type="number"
        value={categoryScores[category.id].score}
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
          {level.level}
        </MenuItem>
      ))}
    </Select>
  );
};

export default RubricScore;
