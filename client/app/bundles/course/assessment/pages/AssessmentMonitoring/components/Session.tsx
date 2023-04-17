import { useState } from 'react';
import { Snapshot } from 'types/channels/liveMonitoring';

import { useAppSelector } from 'lib/hooks/store';

import useMonitoring from '../hooks/useMonitoring';
import usePresence, { Presence } from '../hooks/usePresence';
import { select, selectSnapshot } from '../selectors';

import SessionBlob from './SessionBlob';
import SessionDetailsPopup from './SessionDetailsPopup';

interface SessionProps {
  for: number;
  onClick?: (sessionId: number) => void;
}

interface ActiveSessionProps extends SessionProps {
  of: Snapshot;
}

export const PRESENCE_COLORS: Record<Presence, string> = {
  alive: 'bg-green-400',
  late: 'bg-amber-400',
  missing: 'bg-red-500',
};

const ActiveSession = (props: ActiveSessionProps): JSX.Element => {
  const { of: snapshot, for: userId } = props;

  const { hasSecret } = useAppSelector(select('monitor'));

  const monitoring = useMonitoring();

  const presence = usePresence(snapshot, {
    onMissing: (timestamp) =>
      monitoring.notifyMissingAt(timestamp, userId, snapshot.userName ?? ''),
    onAlive: (timestamp) =>
      monitoring.notifyAliveAt(timestamp, userId, snapshot.userName ?? ''),
  });

  const [popupData, setPopupData] =
    useState<[HTMLElement | undefined, string | undefined]>();

  return (
    <>
      <SessionBlob
        className={PRESENCE_COLORS[presence]}
        for={snapshot}
        onClick={(e): void => {
          monitoring.select(userId);
          props.onClick?.(snapshot.sessionId);
          setPopupData([e.currentTarget, new Date().toISOString()]);
        }}
      />

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

const isActiveSession = (snapshot: Snapshot): boolean =>
  Boolean(snapshot.sessionId) &&
  snapshot.status === 'listening' &&
  Boolean(snapshot.lastHeartbeatAt);

const Session = (props: SessionProps): JSX.Element => {
  const { for: userId } = props;

  const snapshot = useAppSelector(selectSnapshot(userId));

  return isActiveSession(snapshot) ? (
    <ActiveSession {...props} of={snapshot} />
  ) : (
    <SessionBlob className="bg-neutral-100" for={snapshot} />
  );
};

export default Session;
