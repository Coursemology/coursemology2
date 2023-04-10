import { ComponentProps } from 'react';
import { Tooltip } from '@mui/material';
import { Snapshot } from 'types/channels/liveMonitoring';

interface SessionBlobProps extends ComponentProps<'div'> {
  for?: Snapshot;
  className?: string;
}

const SessionBlob = (props: SessionBlobProps): JSX.Element => {
  const { for: snapshot, ...divProps } = props;

  const blob = (
    <div
      {...divProps}
      className={`wh-8 m-1 shrink-0 rounded hover:ring-2 hover:ring-offset-1 ${
        snapshot?.selected ? 'ring-2 ring-offset-1' : ''
      } ${snapshot?.hidden ? 'hidden' : ''} ${props.className ?? ''}`}
    />
  );

  if (!snapshot) return blob;

  return (
    <Tooltip arrow disableInteractive title={snapshot.userName}>
      {blob}
    </Tooltip>
  );
};

export default SessionBlob;
