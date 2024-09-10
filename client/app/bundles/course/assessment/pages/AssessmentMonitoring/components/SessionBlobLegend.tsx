import { memo } from 'react';
import { Remove } from '@mui/icons-material';
import { Tooltip, Typography } from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../translations';

import { PRESENCE_COLORS } from './ActiveSessionBlob';
import SessionBlob from './SessionBlob';

interface SessionBlobLegendProps {
  validates: boolean;
}

const SessionBlobLegend = (props: SessionBlobLegendProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Tooltip
      title={
        <div className="flex flex-col space-y-4">
          <div className="flex space-x-2">
            <SessionBlob className="border border-solid border-neutral-200/50" />

            <Typography className="mt-1" variant="body2">
              {t(translations.noActiveSessions)}
            </Typography>
          </div>

          <div className="flex space-x-2">
            <SessionBlob className="bg-neutral-200" />

            <Typography className="mt-1" variant="body2">
              {t(translations.expiredSession)}
            </Typography>
          </div>

          <div className="flex space-x-2">
            <SessionBlob className="bg-sky-200 flex items-center justify-center">
              <Remove color="disabled" fontSize="small" />
            </SessionBlob>

            <Typography className="mt-1" variant="body2">
              {t(translations.stoppedSession)}
            </Typography>
          </div>

          <div className="flex space-x-2">
            <SessionBlob className={PRESENCE_COLORS.alive} />

            <Typography className="mt-1" variant="body2">
              {props.validates
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
