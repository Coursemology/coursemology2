import { StoryData } from './stories';

export interface RoomData {
  id: number;
  creatorCourseUserId: number;
  creatorCourseUserName: string;
  startedAt: string;
}

export interface RoomsIndexData {
  story: { id: number } & Pick<StoryData, 'title'>;
  rooms: RoomData[];
}
