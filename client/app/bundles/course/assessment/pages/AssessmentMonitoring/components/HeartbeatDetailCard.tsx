import { Chip, Tooltip, Typography } from '@mui/material';
import { HeartbeatDetail } from 'types/channels/liveMonitoring';

import useTranslation from 'lib/hooks/useTranslation';
import { formatPreciseDateTime } from 'lib/moment';

import translations from '../../../translations';

import UserAgentDetail from './UserAgentDetail';

interface HeartbeatDetailCardProps {
  of: HeartbeatDetail;
  hasSecret?: boolean;
  className?: string;
  delta?: number;
}

const HeartbeatDetailCard = (props: HeartbeatDetailCardProps): JSX.Element => {
  const { of: heartbeat } = props;

  const { t } = useTranslation();

  return (
    <section
      className={`space-y-4 rounded-lg bg-neutral-100 p-4 ${
        props.className ?? ''
      }`}
    >
      <section>
        <Typography color="text.secondary" variant="caption">
          {t(translations.generatedAt)}
        </Typography>

        <span className="flex space-x-2 items-center">
          <Typography variant="body2">
            {formatPreciseDateTime(heartbeat.generatedAt)}
          </Typography>

          {heartbeat.stale ? (
            <Tooltip title={t(translations.staleHint)}>
              <Chip
                className="text-neutral-400 border-neutral-400 cursor-pointer select-none"
                label={t(translations.stale)}
                size="small"
                variant="outlined"
              />
            </Tooltip>
          ) : (
            <Tooltip title={t(translations.liveHint)}>
              <Chip
                className="text-neutral-800 border-neutral-800 cursor-pointer select-none"
                label={t(translations.live)}
                size="small"
                variant="outlined"
              />
            </Tooltip>
          )}
        </span>

        {props.delta !== undefined && (
          <Typography variant="caption">
            {props.delta > 0
              ? t(translations.deltaFromPreviousHeartbeat, {
                  ms: props.delta.toLocaleString(),
                })
              : t(translations.firstReceivedHeartbeat)}
          </Typography>
        )}
      </section>

      <section className="space-y-2">
        <Typography color="text.secondary" variant="caption">
          {t(translations.userAgent)}
        </Typography>

        <UserAgentDetail
          of={heartbeat.userAgent}
          valid={heartbeat.isValid}
          validate={props.hasSecret}
        />
      </section>
    </section>
  );
};

export default HeartbeatDetailCard;
