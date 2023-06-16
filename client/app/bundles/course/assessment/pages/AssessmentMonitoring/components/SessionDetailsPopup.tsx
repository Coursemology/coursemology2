import Draggable from 'react-draggable';
import { Cancel, CheckCircle, Close } from '@mui/icons-material';
import { Chip, IconButton, Popover, Typography } from '@mui/material';
import { HeartbeatDetail } from 'types/channels/liveMonitoring';

import Table from 'lib/components/table';
import useTranslation from 'lib/hooks/useTranslation';
import { formatPreciseDateTime, formatPreciseTime } from 'lib/moment';

import translations from '../../../translations';

interface SessionDetailsPopupProps {
  for: string;
  showing: HeartbeatDetail[];
  open: boolean;
  onClose: () => void;
  generatedAt?: string;
  anchorsOn?: HTMLElement;
  hasSecret?: boolean;
}

interface BlankableProps {
  of?: string;
  className?: string;
}

interface ValidableProps extends BlankableProps {
  valid?: boolean;
}

const Blankable = ({ of: value, className }: BlankableProps): JSX.Element => {
  const { t } = useTranslation();

  return value !== undefined ? (
    <Typography className={className} variant="body2">
      {value}
    </Typography>
  ) : (
    <Typography
      className={`italic ${className ?? ''}`}
      color="text.disabled"
      variant="body2"
    >
      {t(translations.blankField)}
    </Typography>
  );
};

const Validable = ({ valid, ...props }: ValidableProps): JSX.Element => (
  <div className="flex space-x-2">
    {valid ? <CheckCircle color="success" /> : <Cancel color="error" />}
    <Blankable {...props} className="mt-0.5" />
  </div>
);

const SessionDetailsPopup = (props: SessionDetailsPopupProps): JSX.Element => {
  const {
    anchorsOn: anchorElement,
    for: name,
    showing: heartbeats,
    generatedAt: time,
  } = props;

  const lastHeartbeat = heartbeats[0];

  const { t } = useTranslation();

  return (
    <Draggable handle=".handle">
      <Popover
        anchorEl={anchorElement}
        classes={{
          paper:
            'px-4 pb-4 @container w-[36rem] shadow-xl border border-solid border-neutral-200 space-y-4 resize',
        }}
        elevation={0}
        onClose={props.onClose}
        open={props.open}
        transformOrigin={{ vertical: 'center', horizontal: 'center' }}
      >
        <header className="handle sticky top-0 -mx-4 mb-4 cursor-move border-0 border-b border-solid border-neutral-200 bg-white p-4">
          <IconButton
            className="float-right ml-5"
            edge="end"
            onClick={props.onClose}
            size="small"
          >
            <Close />
          </IconButton>

          <Typography>{name}</Typography>

          <Typography color="text.secondary" variant="caption">
            {t(translations.summaryCorrectAsAt, {
              time: formatPreciseDateTime(time),
            })}
          </Typography>
        </header>

        <Typography
          className="!-mb-1 ml-2"
          color="text.secondary"
          variant="body2"
        >
          {t(translations.lastHeartbeat)}
        </Typography>

        <section className="space-y-4 rounded-lg bg-neutral-100 p-4">
          <section>
            <Typography color="text.secondary" variant="caption">
              {t(translations.generatedAt)}
            </Typography>

            <Typography variant="body2">
              {formatPreciseDateTime(lastHeartbeat?.generatedAt)}
            </Typography>
          </section>

          <section>
            <Typography color="text.secondary" variant="caption">
              {t(translations.userAgent)}
            </Typography>

            {props.hasSecret ? (
              <Validable
                of={lastHeartbeat?.userAgent}
                valid={lastHeartbeat?.isValid}
              />
            ) : (
              <Blankable of={lastHeartbeat?.userAgent} />
            )}
          </section>
        </section>

        <Typography
          className="!-mb-1 !mt-7 ml-2"
          color="text.secondary"
          variant="body2"
        >
          {t(translations.detailsOfNHeartbeats, {
            n: heartbeats.length,
          })}
        </Typography>

        <Table
          columns={[
            {
              of: 'generatedAt',
              title: t(translations.generatedAt),
              cell: ({ generatedAt }) => formatPreciseTime(generatedAt),
              className: '@lg:sticky @lg:left-0 @lg:bg-neutral-100 z-10',
            },
            {
              of: 'stale',
              title: t(translations.type),
              cell: ({ stale }) =>
                stale ? (
                  <Chip
                    color="info"
                    label={t(translations.stale)}
                    size="small"
                    variant="outlined"
                  />
                ) : (
                  <Chip
                    color="success"
                    label={t(translations.live)}
                    size="small"
                    variant="outlined"
                  />
                ),
            },
            {
              of: 'userAgent',
              title: t(translations.userAgent),
              cell: ({ userAgent }) =>
                props.hasSecret ? (
                  <Validable
                    of={lastHeartbeat?.userAgent}
                    valid={lastHeartbeat?.isValid}
                  />
                ) : (
                  <Blankable of={userAgent} />
                ),
              className: 'whitespace-nowrap',
            },
            {
              of: 'ipAddress',
              title: t(translations.ipAddress),
              cell: ({ ipAddress }) => <Blankable of={ipAddress} />,
            },
          ]}
          data={heartbeats}
          getRowId={(heartbeat): string => heartbeat.generatedAt?.toString()}
        />
      </Popover>
    </Draggable>
  );
};

export default SessionDetailsPopup;
