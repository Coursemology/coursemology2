import { FC } from 'react';
import { RubricCategoryData } from 'types/course/rubrics';

import { AnswerTableEntry } from './types';

const CategoryGradeCell: FC<{
  answer: AnswerTableEntry;
  category: RubricCategoryData;
}> = ({ answer, category }) => (
  <div className="space-y-1">
    <p className="m-0 text-center w-full">
      {answer.evaluation?.grades?.[category.id]} / {category.maximumGrade}
    </p>
  </div>
);

export default CategoryGradeCell;
