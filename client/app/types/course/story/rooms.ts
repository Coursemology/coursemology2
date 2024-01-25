import { StoryData } from './stories';

export interface RoomData {
  id: number;
  creatorCourseUserId: number;
  creatorCourseUserName: string;
  startedAt: string;
}

export interface RoomsIndexData {
  story: Pick<StoryData, 'id' | 'title'>;
  rooms: RoomData[];
}
