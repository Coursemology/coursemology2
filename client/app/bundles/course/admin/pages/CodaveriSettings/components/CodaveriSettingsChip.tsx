import { FC } from 'react';
import { Chip } from '@mui/material';
import {
  CodaveriSettings,
  ProgrammingQuestion,
} from 'types/course/admin/codaveri';

import useTranslation from 'lib/hooks/useTranslation';

import translations from '../translations';

interface CodaveriSettingsChipProps {
  questions: ProgrammingQuestion[];
  for: CodaveriSettings;
}

const CodaveriSettingsChip: FC<CodaveriSettingsChipProps> = (props) => {
  const { questions, for: settings } = props;
  const { t } = useTranslation();

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
