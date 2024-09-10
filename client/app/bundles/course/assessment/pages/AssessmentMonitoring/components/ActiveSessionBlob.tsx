import { ElementType, ReactNode, useState } from 'react';
import { Remove } from '@mui/icons-material';
import { Badge } from '@mui/material';
import { Snapshot } from 'types/channels/liveMonitoring';

import { useAppSelector } from 'lib/hooks/store';

import useMonitoring from '../hooks/useMonitoring';
import usePresence from '../hooks/usePresence';
import { select } from '../selectors';
import { Presence } from '../utils';

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
  warns?: boolean;
  getHeartbeats?: (sessionId: number, limit?: number) => void;
}

interface BaseActiveSessionBlobProps extends ActiveSessionBlobProps {
  className?: string;
  children?: ReactNode;
}

const BaseActiveSessionBlob = (
  props: BaseActiveSessionBlobProps,
): JSX.Element => {
  const { of: snapshot, for: userId } = props;

  const { validates, browserAuthorizationMethod } = useAppSelector(
    select('monitor'),
  );

  const monitoring = useMonitoring();

  const [popupData, setPopupData] =
    useState<[HTMLElement | undefined, string | undefined]>();

  return (
    <>
      <Badge
        badgeContent={props.warns ? undefined : 0}
        color="error"
        overlap="circular"
        variant="dot"
      >
        <SessionBlob
          className={props.className}
          of={snapshot}
          onClick={(e): void => {
            monitoring.select(userId);
            props.getHeartbeats?.(snapshot.sessionId);
            setPopupData([e.currentTarget, new Date().toISOString()]);
          }}
        >
          {props.children}
        </SessionBlob>
      </Badge>

      <SessionDetailsPopup
        anchorsOn={popupData?.[0]}
        browserAuthorizationMethod={browserAuthorizationMethod}
        for={snapshot.userName ?? ''}
        generatedAt={popupData?.[1]}
        onClickShowAllHeartbeats={(): void => {
          props.getHeartbeats?.(snapshot.sessionId, -1);
          setPopupData((data) => [data?.[0], new Date().toISOString()]);
        }}
        onClose={(): void => {
          setPopupData((data) => [undefined, data?.[1]]);
          monitoring.deselect();
        }}
        open={Boolean(snapshot.recentHeartbeats && popupData?.[0])}
        showing={snapshot.recentHeartbeats ?? []}
        submissionId={snapshot.submissionId}
        validates={validates}
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
  <BaseActiveSessionBlob {...props} className="bg-neutral-200" />
);

const StoppedSessionBlob = (props: ActiveSessionBlobProps): JSX.Element => (
  <BaseActiveSessionBlob
    {...props}
    className="bg-sky-200 flex items-center justify-center"
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
