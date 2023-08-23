import { ElementType, ReactNode, useState } from 'react';
import { Remove } from '@mui/icons-material';
import { Snapshot } from 'types/channels/liveMonitoring';

import { useAppSelector } from 'lib/hooks/store';

import useMonitoring from '../hooks/useMonitoring';
import usePresence, { Presence } from '../hooks/usePresence';
import { select } from '../selectors';

import SessionBlob from './SessionBlob';
import SessionDetailsPopup from './SessionDetailsPopup';

export const PRESENCE_COLORS: Record<Presence, string> = {
  alive: 'bg-green-400',
  late: 'bg-amber-400',
  missing: 'bg-red-500',
};

export interface ActiveSessionBlobProps {
  of: Snapshot;
  for: number;
  onClick?: (sessionId: number) => void;
}

interface BaseActiveSessionBlobProps extends ActiveSessionBlobProps {
  className?: string;
  children?: ReactNode;
}

const BaseActiveSessionBlob = (
  props: BaseActiveSessionBlobProps,
): JSX.Element => {
  const { of: snapshot, for: userId } = props;

  const { hasSecret } = useAppSelector(select('monitor'));

  const monitoring = useMonitoring();

  const [popupData, setPopupData] =
    useState<[HTMLElement | undefined, string | undefined]>();

  return (
    <>
      <SessionBlob
        className={props.className}
        of={snapshot}
        onClick={(e): void => {
          monitoring.select(userId);
          props.onClick?.(snapshot.sessionId);
          setPopupData([e.currentTarget, new Date().toISOString()]);
        }}
      >
        {props.children}
      </SessionBlob>

      <SessionDetailsPopup
        anchorsOn={popupData?.[0]}
        for={snapshot.userName ?? ''}
        generatedAt={popupData?.[1]}
        hasSecret={hasSecret}
        onClose={(): void => {
          setPopupData((data) => [undefined, data?.[1]]);
          monitoring.deselect();
        }}
        open={Boolean(snapshot.recentHeartbeats && popupData?.[0])}
        showing={snapshot.recentHeartbeats ?? []}
      />
    </>
  );
};

const ListeningSessionBlob = (props: ActiveSessionBlobProps): JSX.Element => {
  const { of: snapshot, for: userId } = props;

  const monitoring = useMonitoring();

  const presence = usePresence(snapshot, {
    onMissing: (timestamp) =>
      monitoring.notifyMissingAt(timestamp, userId, snapshot.userName ?? ''),
    onAlive: (timestamp) =>
      monitoring.notifyAliveAt(timestamp, userId, snapshot.userName ?? ''),
  });

  return (
    <BaseActiveSessionBlob {...props} className={PRESENCE_COLORS[presence]} />
  );
};

const ExpiredSessionBlob = (props: ActiveSessionBlobProps): JSX.Element => (
  <BaseActiveSessionBlob
    {...props}
    className="border border-solid border-neutral-200 bg-neutral-100"
  />
);

const StoppedSessionBlob = (props: ActiveSessionBlobProps): JSX.Element => (
  <BaseActiveSessionBlob
    {...props}
    className="bg-neutral-200 flex items-center justify-center"
  >
    <Remove color="disabled" fontSize="small" />
  </BaseActiveSessionBlob>
);

const blobs: Record<Snapshot['status'], ElementType<ActiveSessionBlobProps>> = {
  listening: ListeningSessionBlob,
  expired: ExpiredSessionBlob,
  stopped: StoppedSessionBlob,
};

const ActiveSessionBlob = (props: ActiveSessionBlobProps): JSX.Element => {
  const { of: snapshot } = props;

  const Blob = blobs[snapshot.status];
  if (!Blob) throw new Error(`Unknown status: ${snapshot.status}`);

  return <Blob {...props} />;
};

export default ActiveSessionBlob;
