import { FC, useState } from 'react';
import { Card, Popover, Typography } from '@mui/material';
import { RubricCategoryData } from 'types/course/rubrics';

import { AnswerTableEntry } from './types';

enum ColorPalette {
  GRAY = 'gray',
  AMBER = 'amber',
}

const ColorPaletteClassMapper: Record<
  ColorPalette,
  { grade: string; background: string }
> = {
  [ColorPalette.GRAY]: {
    grade: 'bg-gray-200',
    background: 'bg-gray-100',
  },
  [ColorPalette.AMBER]: {
    grade: 'bg-amber-200',
    background: 'bg-amber-100',
  },
};

const CategoryRow: FC<{
  grade?: number;
  explanation?: string | TrustedHTML;
  palette: ColorPalette;
  valueCount: number;
  valueTotal: number;
  selected: boolean;
  isUnevaluated?: boolean;
}> = (props) => {
  const valuePercent =
    props.valueTotal === 0 ? 0 : (props.valueCount * 100) / props.valueTotal;

  const colors = ColorPaletteClassMapper[props.palette];

  return (
    <Card
      className={`min-h-16 flex flex-row ${props.selected ? 'border-2 border-gray-700' : ''}`}
      variant="outlined"
    >
      <div className={`w-12 ${colors.grade}`}>
        {typeof props.grade === 'number' && (
          <Typography className="w-full text-center" variant="h6">
            {props.grade}
          </Typography>
        )}
        {props.valueTotal > 1 && (
          <Typography
            className="w-full text-center"
            display="block"
            variant="caption"
          >
            {props.valueCount}/{props.valueTotal}
          </Typography>
        )}
      </div>
      <div className="flex-1 relative py-1 px-2">
        <div>
          {props.isUnevaluated ? (
            <Typography
              className="relative z-50 m-2"
              display="inline"
              fontStyle="italic"
              variant="body2"
            >
              Not evaluated yet
            </Typography>
          ) : (
            <Typography
              className="relative z-50 m-2"
              dangerouslySetInnerHTML={{
                __html: props.explanation ?? '',
              }}
              display="inline"
              variant="body2"
            />
          )}
        </div>
        {Boolean(valuePercent) && (
          <div
            className={`absolute top-0 left-0 h-full ${colors.background}`}
            style={{ width: `${Math.round(valuePercent)}%` }}
          />
        )}
      </div>
    </Card>
  );
};

const CategoryGradeCell: FC<{
  answer: AnswerTableEntry;
  category: RubricCategoryData;
  compareGrades?: (number | undefined)[];
}> = (props) => {
  const { answer, category, compareGrades } = props;
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (): void => {
    setAnchorEl(null);
  };

  const isPopoverOpen = Boolean(anchorEl);

  const categoryGrade = answer.evaluation?.grades?.[category.id];
  const categoryGradeText =
    typeof categoryGrade === 'number'
      ? `${categoryGrade} / ${category.maximumGrade}`
      : `- / ${category.maximumGrade}`;

  // Calculate distribution of unique values in compareGrades
  // Nullish values (null/undefined) are treated as a single distinct category
  const gradeDistribution = compareGrades?.reduce<{
    nullishCount: number;
    numericValues: Map<number, number>;
  }>(
    (dist, grade) => {
      if (grade == null) {
        dist.nullishCount += 1;
      } else {
        dist.numericValues.set(grade, (dist.numericValues.get(grade) ?? 0) + 1);
      }
      return dist;
    },
    { nullishCount: 0, numericValues: new Map() },
  );

  const totalUniqueValues = gradeDistribution
    ? gradeDistribution.numericValues.size
    : 0;
  const compareGradesUnequal = totalUniqueValues > 1;

  // Calculate normalized entropy (0 = all same, 1 = maximum diversity) for all non-null values.
  const calculateEntropy = (): number => {
    if (!gradeDistribution || !compareGrades || compareGrades.length === 0) {
      return 0;
    }

    const counts = Array.from(gradeDistribution.numericValues.values());
    const total = counts.reduce((a, b) => a + b, 0);

    // Shannon entropy: -Σ(p_i * log2(p_i))
    const shannonEntropy = counts.reduce((sum, count) => {
      const p = count / total;
      return sum - p * Math.log2(p);
    }, 0);

    // Normalize by maximum possible entropy (log2 of unique values)
    const maxEntropy = totalUniqueValues > 1 ? Math.log2(totalUniqueValues) : 0;
    return maxEntropy === 0 ? 0 : shannonEntropy / maxEntropy;
  };

  // Map entropy to discrete Tailwind amber shades (lighter = lower entropy, darker = higher)
  const getEntropyColorClass = (): string => {
    const entropy = calculateEntropy();
    if (entropy < 0.65) return 'bg-amber-100 border-amber-300';
    if (entropy < 0.8) return 'bg-amber-200 border-amber-400';
    if (entropy < 0.95) return 'bg-amber-300 border-amber-500';
    return 'bg-amber-400 border-amber-600';
  };

  return (
    <>
      <div className="space-y-1" onClick={handleClick}>
        {compareGradesUnequal ? (
          <Card
            className={`text-center mx-1 ${getEntropyColorClass()}`}
            variant="outlined"
          >
            {categoryGradeText}
          </Card>
        ) : (
          <p className="m-0 text-center w-full">{categoryGradeText}</p>
        )}
      </div>
      <Popover
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        onClose={handleClose}
        open={isPopoverOpen}
        slotProps={{ paper: { className: 'w-1/2 [&_p]:m-0 p-3 space-y-3' } }}
      >
        <Typography fontWeight="bold" variant="body2">
          {category.name}
        </Typography>
        {category.criterions.map((criterion) => {
          const isCriterionSelected = categoryGrade === criterion.grade;
          let valueCount = isCriterionSelected ? 1 : 0;
          if (gradeDistribution) {
            valueCount =
              gradeDistribution.numericValues.get(criterion.grade) ?? 0;
          }
          const valueTotal = gradeDistribution ? compareGrades?.length ?? 0 : 1;
          return (
            <CategoryRow
              key={criterion.id}
              explanation={criterion.explanation}
              grade={criterion.grade}
              palette={
                valueCount === 0 ? ColorPalette.GRAY : ColorPalette.AMBER
              }
              selected={isCriterionSelected}
              valueCount={valueCount}
              valueTotal={valueTotal}
            />
          );
        })}
        {compareGrades && Boolean(gradeDistribution?.nullishCount) && (
          <CategoryRow
            isUnevaluated
            palette={
              typeof categoryGrade === 'number'
                ? ColorPalette.GRAY
                : ColorPalette.AMBER
            }
            selected={typeof categoryGrade !== 'number'}
            valueCount={gradeDistribution?.nullishCount ?? 0}
            valueTotal={compareGrades.length}
          />
        )}
      </Popover>
    </>
  );
};

export default CategoryGradeCell;
