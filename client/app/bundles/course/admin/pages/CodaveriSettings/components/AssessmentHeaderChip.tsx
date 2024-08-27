import { FC } from 'react';
import { Chip } from '@mui/material';
import { ProgrammingQuestion } from 'types/course/admin/codaveri';

import { useAppSelector } from 'lib/hooks/store';
import useTranslation, { Descriptor } from 'lib/hooks/useTranslation';

import { getProgrammingQuestionsForAssessments } from '../selectors';
import translations from '../translations';

const AssessmentCodaveriQuestionMap = {
  None: {
    text: translations.None,
    color: 'text-red-600 border-red-600',
  },
  Some: {
    text: translations.Some,
    color: 'text-blue-600 border-blue-600',
  },
  All: {
    text: translations.All,
    color: 'text-green-600 border-green-600',
  },
} satisfies Record<
  'None' | 'Some' | 'All',
  { text: Descriptor; color: string }
>;

const checkCodaveriExist = (
  questions: ProgrammingQuestion[],
): keyof typeof AssessmentCodaveriQuestionMap => {
  if (questions.every((qn) => qn.isCodaveri)) {
    return 'All';
  }
  if (questions.some((qn) => qn.isCodaveri)) {
    return 'Some';
  }
  return 'None';
};

interface AssessmentHeaderChipProps {
  assessmentIds: number[];
}

const AssessmentHeaderChip: FC<AssessmentHeaderChipProps> = (props) => {
  const { assessmentIds } = props;
  const { t } = useTranslation();

  const questions = useAppSelector((state) =>
    getProgrammingQuestionsForAssessments(state, assessmentIds),
  );

  const codaveriQuestionsExist = checkCodaveriExist(questions);

  return (
    <Chip
      className={`ml-2 ${AssessmentCodaveriQuestionMap[codaveriQuestionsExist].color}`}
      label={t(AssessmentCodaveriQuestionMap[codaveriQuestionsExist].text)}
      size="small"
      variant="outlined"
    />
  );
};

export default AssessmentHeaderChip;
