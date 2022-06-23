import { InstanceUserListData } from 'types/instanceUsers';
import { CourseUserListData } from './courseUsers';

export interface NotificationData {
  id: number;
  userInfo: CourseUserListData | InstanceUserListData;
  isCourseUser: boolean;
  actableType:
    | 'achievement'
    | 'assessment'
    | 'level'
    | 'topicCreate'
    | 'topicReply'
    | 'topicVote'
    | 'video';
  actableId: number;
  // One or the other
  actableName?: string;
  levelNumber?: number;

  // Only if its a forum notification
  forumName?: string;
  topicName?: string;
  // Only if its a forum reply
  anchor?: string;

  createdAt: string;
}
