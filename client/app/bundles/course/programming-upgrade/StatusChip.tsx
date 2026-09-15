import { FC } from 'react';
import { InfoOutlined } from '@mui/icons-material';
import { Chip, Tooltip } from '@mui/material';
import {
  ProgrammingLanguageData,
  ProgrammingUpgradeQuestionData,
} from 'types/course/programmingUpgrade';
import { JobErrored } from 'types/jobs';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import useTranslation from 'lib/hooks/useTranslation';

import { statusOf, UpgradeStatus } from './status';
import translations from './translations';

export const STATUS_LABELS = {
  importFailed: translations.statusImportFailed,
  pending: translations.statusPending,
  deprecated: translations.statusDeprecated,
  upgradable: translations.statusUpgradable,
  ok: translations.statusOk,
} as const;

const STATUS_COLORS = {
  importFailed: 'error',
  pending: 'info',
  deprecated: 'warning',
  upgradable: 'default',
  ok: 'success',
} as const;

interface StatusChipProps {
  question: ProgrammingUpgradeQuestionData;
  language?: ProgrammingLanguageData;
}

const StatusChip: FC<StatusChipProps> = ({ question, language }) => {
  const { t } = useTranslation();
  const status: UpgradeStatus = statusOf(question, language);

  if (status === null) return null;

  const chip = (
    <Chip
      className="w-fit py-1.5 h-auto"
      color={STATUS_COLORS[status]}
      icon={
        status === 'pending' ? <LoadingIndicator bare size={15} /> : undefined
      }
      label={t(STATUS_LABELS[status])}
      variant="outlined"
    />
  );

  if (status === 'importFailed') {
    const errorMessage = (question.upgrade?.job as JobErrored)?.errorMessage;

    return (
      <div className="flex items-center gap-2">
        {chip}
        {errorMessage && (
          <Tooltip title={errorMessage}>
            <InfoOutlined color="info" fontSize="small" />
          </Tooltip>
        )}
      </div>
    );
  }

  if (status === 'deprecated') {
    return <Tooltip title={t(translations.deprecatedLanguage)}>{chip}</Tooltip>;
  }

  return chip;
};

export default StatusChip;
