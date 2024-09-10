import { SebPayload } from 'types/course/assessment/monitoring';

import { BrowserAuthorizationMethod } from 'course/assessment/components/monitoring/BrowserAuthorizationMethodOptionsFormFields/common';

export interface MonitoringMonitorData {
  maxIntervalMs: number;
  offsetMs: number;
  validates: boolean;
  browserAuthorizationMethod: BrowserAuthorizationMethod;
}

export interface HeartbeatDetail {
  stale: boolean;
  userAgent: string;
  ipAddress: string;
  generatedAt: string;
  isValid: boolean;
  sebPayload?: SebPayload;
}

export interface SnapshotData {
  sessionId: number;
  status: 'expired' | 'listening' | 'stopped';
  misses: number;
  lastHeartbeatAt: string;
  isValid: boolean;
  userName?: string;
  submissionId?: number;
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
