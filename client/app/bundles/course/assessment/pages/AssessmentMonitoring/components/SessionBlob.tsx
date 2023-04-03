import { ComponentProps } from 'react';
import { Tooltip } from '@mui/material';
import { Snapshot } from 'types/channels/liveMonitoring';

interface SessionBlobProps extends ComponentProps<'div'> {
  for: Snapshot;
  className?: string;
}

const SessionBlob = (props: SessionBlobProps): JSX.Element => {
  const { for: snapshot, ...divProps } = props;

  return (
    <Tooltip arrow disableInteractive title={snapshot.userName}>
      <div
        {...divProps}
        className={`m-1 rounded wh-8 hover:ring-2 hover:ring-offset-1 ${
          snapshot.selected ? 'ring-2 ring-offset-1' : ''
        } ${snapshot.hidden ? 'hidden' : ''} ${props.className ?? ''}`}
      />
    </Tooltip>
  );
};

export default SessionBlob;
