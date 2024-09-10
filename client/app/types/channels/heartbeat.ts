import { SebPayload } from 'types/course/assessment/monitoring';

export interface HeartbeatPostData {
  timestamp: number;
  sebPayload?: SebPayload;
}

export interface NextActionData {
  action: 'next';
  nextTimeout: number;
  received: HeartbeatPostData['timestamp'];
}

export interface FlushedActionData {
  action: 'flushed';
  from: HeartbeatPostData['timestamp'];
  to: HeartbeatPostData['timestamp'];
}
