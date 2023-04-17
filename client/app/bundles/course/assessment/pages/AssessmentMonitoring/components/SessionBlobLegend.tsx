import { memo } from 'react';
import { Tooltip, Typography } from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../translations';

import { PRESENCE_COLORS } from './Session';
import SessionBlob from './SessionBlob';

interface SessionBlobLegendProps {
  hasSecret: boolean;
}

const SessionBlobLegend = (props: SessionBlobLegendProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Tooltip
      title={
        <div className="flex flex-col space-y-4">
          <div className="flex space-x-2">
            <SessionBlob className="bg-neutral-100" />
            <Typography className="mt-1" variant="body2">
              {t(translations.noActiveSessions)}
            </Typography>
          </div>

          <div className="flex space-x-2">
            <SessionBlob className={PRESENCE_COLORS.alive} />

            <Typography className="mt-1" variant="body2">
              {props.hasSecret
                ? t(translations.alivePresenceHintSUSMatches)
                : t(translations.alivePresenceHint)}
            </Typography>
          </div>

          <div className="flex space-x-2">
            <SessionBlob className={PRESENCE_COLORS.late} />

            <Typography className="mt-1" variant="body2">
              {t(translations.latePresenceHint)}
            </Typography>
          </div>

          <div className="flex space-x-2">
            <SessionBlob className={PRESENCE_COLORS.missing} />

            <Typography className="mt-1" variant="body2">
              {t(translations.missingPresenceHint)}
            </Typography>
          </div>
        </div>
      }
    >
      <Typography
        className="w-fit cursor-pointer underline"
        color="text.secondary"
        variant="body2"
      >
        What do these colours mean?
      </Typography>
    </Tooltip>
  );
};

export default memo(SessionBlobLegend);
