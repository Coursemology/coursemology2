import { FC } from 'react';
import { Chip } from '@mui/material';
import {
  CodaveriSettings,
  ProgrammingQuestion,
} from 'types/course/admin/codaveri';

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

const checkLiveFeedbackExist = (
  questions: ProgrammingQuestion[],
): keyof typeof AssessmentCodaveriQuestionMap => {
  if (questions.every((qn) => qn.liveFeedbackEnabled)) {
    return 'All';
  }
  if (questions.some((qn) => qn.liveFeedbackEnabled)) {
    return 'Some';
  }
  return 'None';
};

interface CodaveriSettingsChipProps {
  assessmentIds: number[];
  for: CodaveriSettings;
}

const CodaveriSettingsChip: FC<CodaveriSettingsChipProps> = (props) => {
  const { assessmentIds, for: settings } = props;
  const { t } = useTranslation();

  const questions = useAppSelector((state) =>
    getProgrammingQuestionsForAssessments(state, assessmentIds),
  );

  const codaveriQuestionsExist = checkCodaveriExist(questions);
  const liveFeedbackExist = checkLiveFeedbackExist(questions);

  const questionsExist =
    settings === 'codaveri_evaluator'
      ? codaveriQuestionsExist
      : liveFeedbackExist;

  return (
    <Chip
      className={`${AssessmentCodaveriQuestionMap[questionsExist].color} w-24`}
      label={t(AssessmentCodaveriQuestionMap[questionsExist].text)}
      size="small"
      variant="outlined"
    />
  );
};

export default CodaveriSettingsChip;
