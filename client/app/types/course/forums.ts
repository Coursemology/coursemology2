import { Permissions, RecursiveArray } from 'types';

export interface EmailSubscriptionSetting {
  isCourseEmailSettingEnabled: boolean;
  isUserEmailSettingEnabled: boolean;
  isUserSubscribed: boolean;
  manageEmailSubscriptionUrl?: string;
}

export interface ForumMetadata {
  nextUnreadPostUrl: string | null;
}

export type ForumPermissions = Permissions<'canCreateForum'>;

export type ForumListDataPermissions = Permissions<
  'canCreateTopic' | 'canEditForum' | 'canDeleteForum'
>;

export type ForumTopicListDataPermissions = Permissions<
  | 'canEditTopic'
  | 'canDeleteTopic'
  | 'canSubscribeTopic'
  | 'canSetHiddenTopic'
  | 'canSetLockedTopic'
  | 'canReplyTopic'
  | 'canToggleAnswer'
>;

export type ForumTopicPostListDataPermissions = Permissions<
  'canEditPost' | 'canDeletePost' | 'canReplyPost'
>;

export enum TopicType {
  NORMAL = 'normal',
  QUESTION = 'question',
  STICKY = 'sticky',
  ANNOUNCEMENT = 'announcement',
}

// export type TopicType = 'normal' | 'question' | 'sticky' | 'announcement';

/**
 * Data types for forum data retrieved from backend through API call.
 */

export interface ForumListData {
  id: number;
  name: string;
  description: string;
  topicUnreadCount: number;
  forumTopicsAutoSubscribe: boolean;
  forumUrl: string;
  isUnresolved: boolean;
  topicCount: number;
  topicPostCount: number;
  topicViewCount: number;
  emailSubscription: EmailSubscriptionSetting;
  permissions: ForumListDataPermissions;
}

export interface ForumTopicListData {
  id: number;
  forumId: number;
  title: string;
  topicUrl: string;
  isUnread: boolean;
  isLocked: boolean;
  isHidden: boolean;
  isResolved: boolean;
  topicType: TopicType;
  creator: { id: number; userUrl: string; name: string };
  voteCount: number;
  postCount: number;
  viewCount: number;

  latestPost: {
    creator: { id: number; userUrl: string; name: string };
    createdAt: string;
  };

  emailSubscription: EmailSubscriptionSetting;
  permissions: ForumTopicListDataPermissions;
}

export interface ForumTopicPostListData {
  id: number;
  topicId: number;
  parentId: number;
  postUrl: string;
  text: string;
  createdAt: string;
  isAnswer: boolean;
  isUnread: boolean;
  hasUserVoted: boolean;
  userVoteFlag: boolean | null;
  voteTally: number;
  creator: { id: number; userUrl: string; name: string; imageUrl: string };

  permissions: ForumTopicPostListDataPermissions;
}

export interface ForumData extends ForumListData {
  availableTopicTypes: TopicType[];
  topicIds: number[];
  permissions: ForumListDataPermissions;
}

export interface ForumTopicData extends ForumTopicListData {}

/**
 * Data types for achievement data used in frontend that are converted from
 * received backend data.
 */

export interface ForumEntity {
  id: ForumListData['id'];
  name: ForumListData['name'];
  description: ForumListData['description'];
  topicUnreadCount: ForumListData['topicUnreadCount'];
  forumTopicsAutoSubscribe: ForumListData['forumTopicsAutoSubscribe'];
  forumUrl: ForumListData['forumUrl'];
  isUnresolved: ForumListData['isUnresolved'];
  topicCount: ForumListData['topicCount'];
  topicPostCount: ForumListData['topicPostCount'];
  topicViewCount: ForumListData['topicViewCount'];
  emailSubscription: ForumListData['emailSubscription'];
  permissions: ForumData['permissions'];

  availableTopicTypes?: ForumData['availableTopicTypes'];
  topicIds: ForumTopicListData['id'][] | null;
}

export interface ForumTopicEntity {
  id: ForumTopicListData['id'];
  forumId: ForumTopicListData['forumId'];
  title: ForumTopicListData['title'];
  topicUrl: ForumTopicListData['topicUrl'];
  isUnread: ForumTopicListData['isUnread'];
  isLocked: ForumTopicListData['isLocked'];
  isHidden: ForumTopicListData['isHidden'];
  isResolved: ForumTopicListData['isResolved'];
  topicType: ForumTopicListData['topicType'];
  creator: ForumTopicListData['creator'];
  voteCount: ForumTopicListData['voteCount'];
  postCount: ForumTopicListData['postCount'];
  viewCount: ForumTopicListData['viewCount'];

  latestPost: ForumTopicListData['latestPost'];

  emailSubscription: ForumTopicListData['emailSubscription'];
  permissions: ForumTopicListData['permissions'];

  postTreeIds?: RecursiveArray<number>;
}

export interface ForumTopicPostEntity {
  id: ForumTopicPostListData['id'];
  topicId: ForumTopicPostListData['topicId'];
  parentId: ForumTopicPostListData['parentId'];
  postUrl: ForumTopicPostListData['postUrl'];
  text: ForumTopicPostListData['text'];
  createdAt: ForumTopicPostListData['createdAt'];
  isAnswer: ForumTopicPostListData['isAnswer'];
  isUnread: ForumTopicPostListData['isUnread'];
  hasUserVoted: ForumTopicPostListData['hasUserVoted'];
  userVoteFlag: ForumTopicPostListData['userVoteFlag'];
  voteTally: ForumTopicPostListData['voteTally'];
  creator: ForumTopicPostListData['creator'];

  permissions: ForumTopicPostListData['permissions'];
}

/**
 * Data types for forum form data.
 */

export interface ForumFormData {
  id?: number;
  name: string;
  description: string;
  forumTopicsAutoSubscribe: boolean;
}

export interface ForumPostData {
  forum: {
    name: ForumFormData['name'];
    description: ForumFormData['description'];
    forum_topics_auto_subscribe: ForumFormData['forumTopicsAutoSubscribe'];
  };
}

export interface ForumPatchData {
  forum: {
    id: ForumFormData['id'];
    name: ForumFormData['name'];
    description: ForumFormData['description'];
    forum_topics_auto_subscribe: ForumFormData['forumTopicsAutoSubscribe'];
  };
}

export interface ForumTopicFormData {
  id?: number;
  title: string;
  text?: string;
  topicType: TopicType;
}

export interface ForumTopicPostData {
  topic: {
    title: ForumTopicFormData['title'];
    topic_type: ForumTopicFormData['topicType'];
    posts_attributes: { text: ForumTopicFormData['text'] }[];
  };
}

export interface ForumTopicPatchData {
  topic: {
    id: ForumTopicFormData['id'];
    title: ForumTopicFormData['title'];
    topic_type: ForumTopicFormData['topicType'];
    posts_attributes: { text: ForumTopicFormData['text'] }[];
  };
}

export interface ForumTopicPostFormData {
  text: string;
  parentId: number | null;
}

/**
 * Data types for forum search data sent to backend
 */
export interface ForumSearchParams {
  params: {
    ['search[course_user_id]']: number;
    ['search[start_time]']: Date;
    ['search[end_time]']: Date;
  };
}
