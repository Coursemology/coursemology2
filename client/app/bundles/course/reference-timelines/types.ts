import {
  ItemWithTimeData,
  TimelineData,
} from 'types/course/referenceTimelines';

export interface TimelinesState {
  timelines: TimelineData[];
  items: ItemWithTimeData[];
  gamified: boolean;
  defaultTimeline: TimelineData['id'];
}
