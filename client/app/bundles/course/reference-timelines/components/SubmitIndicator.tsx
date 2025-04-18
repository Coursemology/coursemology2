import { useEffect, useState } from 'react';
import { Cancel, CheckCircle } from '@mui/icons-material';
import { Chip, Grow, Tooltip, Typography } from '@mui/material';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import useTranslation from 'lib/hooks/useTranslation';
import moment from 'lib/moment';

import { useLastSaved } from '../contexts';
import translations from '../translations';

const RELATIVE_TIME_UPDATE_INTERVAL_MS = 60000 as const;
const ANNOUNCE_ANIMATION_DURATION_MS = 500 as const;
const ANNOUNCE_FLASH_DURATION_MS = 2000 as const;

interface SubmitIndicatorProps {
  className?: string;
}

interface SavedIndicatorProps {
  at: moment.Moment;
  success: boolean;
}

const SavedIndicator = (props: SavedIndicatorProps): JSX.Element => {
  const { at: lastSaved, success } = props;

  const { t } = useTranslation();

  const [announcing, setAnnouncing] = useState(true);
  const [relativeTime, setRelativeTime] = useState('');

  const updateRelativeDescription = (): void =>
    setRelativeTime(lastSaved.fromNow());

  useEffect(() => {
    if (announcing) {
      const timeout = setTimeout(() => {
        setAnnouncing(false);
        updateRelativeDescription();
      }, ANNOUNCE_FLASH_DURATION_MS);

      return () => clearTimeout(timeout);
    }

    const timer = setInterval(
      updateRelativeDescription,
      RELATIVE_TIME_UPDATE_INTERVAL_MS,
    );

    return () => clearInterval(timer);
  }, [announcing]);

  return announcing ? (
    <Grow key="toast" in timeout={ANNOUNCE_ANIMATION_DURATION_MS}>
      <Chip
        color={success ? 'success' : 'error'}
        icon={success ? <CheckCircle /> : <Cancel />}
        label={success ? t(translations.saved) : t(translations.error)}
        size="small"
        variant="outlined"
      />
    </Grow>
  ) : (
    <Grow key="lastSaved" in timeout={ANNOUNCE_ANIMATION_DURATION_MS}>
      <Tooltip
        arrow
        placement="top"
        title={lastSaved?.format('DD MMM YYYY HH:mm:ss')}
      >
        <Typography className="select-none text-neutral-400" variant="caption">
          {success
            ? t(translations.lastSaved, { at: relativeTime })
            : t(translations.unchangedSince, { time: relativeTime })}
        </Typography>
      </Tooltip>
    </Grow>
  );
};

const SubmitIndicator = (props: SubmitIndicatorProps): JSX.Element | null => {
  const { t } = useTranslation();

  const { status, lastSaved } = useLastSaved();

  if (!status && !lastSaved) return null;

  return (
    <div className={`flex items-center space-x-4 ${props.className}`}>
      {status === 'loading' && (
        <>
          <LoadingIndicator bare size={25} />

          <Typography
            className="select-none text-neutral-400"
            variant="caption"
          >
            {t(translations.saving)}
          </Typography>
        </>
      )}

      {status !== 'loading' && lastSaved && (
        <SavedIndicator at={lastSaved} success={status === 'success'} />
      )}
    </div>
  );
};

export default SubmitIndicator;
