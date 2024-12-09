import { Dispatch, SetStateAction } from 'react';
import { Cancel, CheckCircle } from '@mui/icons-material';
import { Chip } from '@mui/material';

import { syncWithKoditsu } from 'course/assessment/operations/assessments';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { SYNC_STATUS } from 'lib/constants/sharedConstants';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';

interface KoditsuSyncIndicatorProps {
  assessmentId: number;
  setSyncStatus: Dispatch<SetStateAction<keyof typeof SYNC_STATUS>>;
  syncStatus: keyof typeof SYNC_STATUS;
}

const KoditsuSyncIndicatorMap = {
  Syncing: {
    color: 'default' as const,
    icon: <LoadingIndicator bare size={20} />,
    label: translations.syncingWithKoditsu,
  },
  Synced: {
    color: 'success' as const,
    icon: <CheckCircle />,
    label: translations.syncedWithKoditsu,
  },
  Failed: {
    color: 'error' as const,
    icon: <Cancel />,
    label: translations.failedSyncingWithKoditsu,
  },
};

const KoditsuChipButton = (
  props: KoditsuSyncIndicatorProps,
): JSX.Element | null => {
  const { assessmentId, setSyncStatus, syncStatus } = props;
  const { t } = useTranslation();

  if (!syncStatus) return null;

  const chipProps = KoditsuSyncIndicatorMap[syncStatus];
  if (!chipProps) return null;

  return (
    <Chip
      clickable={syncStatus === 'Failed'}
      color={chipProps.color}
      icon={chipProps.icon}
      label={t(chipProps.label)}
      onClick={() => {
        if (syncStatus === 'Failed') {
          setSyncStatus('Syncing');

          syncWithKoditsu(assessmentId)
            .then(() => setSyncStatus('Synced'))
            .catch(() => setSyncStatus('Failed'));
        }
      }}
      size="medium"
      variant="outlined"
    />
  );
};

export default KoditsuChipButton;
