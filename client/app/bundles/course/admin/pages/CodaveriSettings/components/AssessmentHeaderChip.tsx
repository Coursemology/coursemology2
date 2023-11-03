import { FC } from 'react';
import { Chip, ChipProps } from '@mui/material';
import { ProgrammingQuestion } from 'types/course/admin/codaveri';

import { useAppSelector } from 'lib/hooks/store';
import useTranslation, { Descriptor } from 'lib/hooks/useTranslation';

import { getProgrammingQuestionsForAssessments } from '../selectors';
import translations from '../translations';

const AssessmentCodaveriQuestionMap = {
  None: {
    text: translations.None,
    color: 'warning',
  },
  Some: {
    text: translations.Some,
    color: 'info',
  },
  All: {
    text: translations.All,
    color: 'success',
  },
} satisfies Record<
  'None' | 'Some' | 'All',
  { text: Descriptor; color: ChipProps['color'] }
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
  assessmentId: number;
}

const AssessmentHeaderChip: FC<AssessmentHeaderChipProps> = (props) => {
  const { assessmentId } = props;
  const { t } = useTranslation();

  const questions = useAppSelector((state) =>
    getProgrammingQuestionsForAssessments(state, [assessmentId]),
  );
  const codaveriQuestionsExist = checkCodaveriExist(questions);

  return (
    <Chip
      className="ml-2"
      color={AssessmentCodaveriQuestionMap[codaveriQuestionsExist].color}
      label={t(AssessmentCodaveriQuestionMap[codaveriQuestionsExist].text)}
      size="small"
      variant="outlined"
    />
  );
};

export default AssessmentHeaderChip;
