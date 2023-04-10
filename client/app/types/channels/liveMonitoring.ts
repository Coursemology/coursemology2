export interface MonitoringMonitorData {
  maxIntervalMs: number;
  offsetMs: number;
  hasSEBHash: boolean;
}

export interface HeartbeatDetail {
  isValidSEBHash: boolean;
  stale: boolean;
  userAgent: string;
  ipAddress: string;
  generatedAt: string;
  sebHash?: string;
}

export interface SnapshotData {
  sessionId: number;
  status: 'expired' | 'listening' | 'stopped';
  lastHeartbeatAt: string;
  isValidSEBHash: boolean;
  sebHash?: string;
  userName?: string;
  stale?: boolean;
}

export type SnapshotsData = Record<number, SnapshotData>;

export interface Snapshot extends SnapshotData {
  selected?: boolean;
  recentHeartbeats?: HeartbeatDetail[];
  hidden?: boolean;
}

export type Snapshots = Record<number, Snapshot>;

export interface WatchGroup {
  id: number;
  name: string;
  category: string;
  userIds: number[];
}

export interface WatchData {
  userIds: number[];
  snapshots: SnapshotsData;
  groups: WatchGroup[];
  monitor: MonitoringMonitorData;
}

export interface PulseData {
  userId: number;
  snapshot: Partial<SnapshotData>;
}
