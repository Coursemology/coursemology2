import { ComponentProps, ReactNode } from 'react';
import { Fade, Tooltip } from '@mui/material';
import { Snapshot } from 'types/channels/liveMonitoring';

interface SessionBlobProps extends ComponentProps<'div'> {
  of?: Snapshot;
  className?: string;
  children?: ReactNode;
}

const SessionBlob = (props: SessionBlobProps): JSX.Element => {
  const { of: snapshot, ...divProps } = props;

  const blob = (
    <div
      {...divProps}
      className={`m-1 shrink-0 rounded wh-8 hover:ring-2 hover:ring-offset-1 ${
        snapshot?.selected ? 'ring-2 ring-offset-1' : ''
      } ${snapshot?.hidden ? 'hidden' : ''} ${props.className ?? ''}`}
    />
  );

  if (!snapshot) return blob;

  return (
    <Tooltip
      arrow
      disableInteractive
      enterDelay={0}
      title={snapshot.userName}
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 0 }}
    >
      {blob}
    </Tooltip>
  );
};

export default SessionBlob;
