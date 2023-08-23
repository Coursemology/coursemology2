import Draggable from 'react-draggable';
import { Close } from '@mui/icons-material';
import { IconButton, Popover, Typography } from '@mui/material';
import { HeartbeatDetail } from 'types/channels/liveMonitoring';

import useTranslation from 'lib/hooks/useTranslation';
import { formatPreciseDateTime } from 'lib/moment';

import translations from '../../../translations';

import HeartbeatDetailCard from './HeartbeatDetailCard';
import HeartbeatsTimeline from './HeartbeatsTimeline';

interface SessionDetailsPopupProps {
  for: string;
  showing: HeartbeatDetail[];
  open: boolean;
  onClose: () => void;
  generatedAt?: string;
  anchorsOn?: HTMLElement;
  hasSecret?: boolean;
}

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

        <HeartbeatDetailCard hasSecret={props.hasSecret} of={lastHeartbeat} />

        <Typography
          className="!-mb-1 !mt-7 ml-2"
          color="text.secondary"
          variant="body2"
        >
          {t(translations.detailsOfNHeartbeats, {
            n: heartbeats.length,
          })}
        </Typography>

        <HeartbeatsTimeline hasSecret={props.hasSecret} in={heartbeats} />
      </Popover>
    </Draggable>
  );
};

export default SessionDetailsPopup;
