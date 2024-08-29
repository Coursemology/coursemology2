import { FC } from 'react';
import { Chip } from '@mui/material';
import { CodaveriSettings } from 'types/course/admin/codaveri';

import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { getProgrammingQuestionsForAssessments } from '../selectors';
import translations from '../translations';

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

  const codaveriQnsCount = questions.filter((qn) => qn.isCodaveri).length;
  const liveFeedbackEnabledQnsCount = questions.filter(
    (qn) => qn.liveFeedbackEnabled,
  ).length;

  const questionsCount =
    settings === 'codaveri_evaluator'
      ? codaveriQnsCount
      : liveFeedbackEnabledQnsCount;

  return questionsCount > 0 && questionsCount < questions.length ? (
    <Chip
      className="text-blue-600 border-blue-600 w-[5.85rem] mr-0.5"
      label={t(translations.Some)}
      size="small"
      variant="outlined"
    />
  ) : (
    <div className="w-[11.75rem]" />
  );
};

export default CodaveriSettingsChip;
