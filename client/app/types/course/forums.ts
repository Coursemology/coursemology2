import { Permissions, RecursiveArray } from 'types';

export interface EmailSubscriptionSetting {
  isCourseEmailSettingEnabled: boolean;
  isUserEmailSettingEnabled: boolean;
  isUserSubscribed: boolean;
  manageEmailSubscriptionUrl?: string;
}

export interface ForumMetadata {
  nextUnreadTopicUrl: string | null;
}

export interface PostCreatorData {
  isAnonymous: boolean;
  creator?: { id: number; userUrl: string; name: string; imageUrl: string };
  createdAt: string;
  permissions: Permissions<'canViewAnonymous'>;
}

export type ForumPermissions = Permissions<'canCreateForum'>;

export type ForumListDataPermissions = Permissions<
  'canCreateTopic' | 'canEditForum' | 'canDeleteForum' | 'isAnonymousEnabled'
>;

export type ForumTopicListDataPermissions = Permissions<
  | 'canEditTopic'
  | 'canDeleteTopic'
  | 'canSubscribeTopic'
  | 'canSetHiddenTopic'
  | 'canSetLockedTopic'
  | 'canReplyTopic'
  | 'canToggleAnswer'
  | 'isAnonymousEnabled'
>;

export type ForumTopicPostListDataPermissions = Permissions<
  | 'canEditPost'
  | 'canDeletePost'
  | 'canReplyPost'
  | 'canViewAnonymous'
  | 'isAnonymousEnabled'
>;

export enum TopicType {
  NORMAL = 'normal',
  QUESTION = 'question',
  STICKY = 'sticky',
  ANNOUNCEMENT = 'announcement',
}

/**
 * Data types for forum data retrieved from backend through API call.
 */

export interface ForumListData {
  id: number;
  name: string;
  description: string;
  topicUnreadCount: number;
  forumTopicsAutoSubscribe: boolean;
  rootForumUrl: string;
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
  voteCount: number;
  postCount: number;
  viewCount: number;

  firstPostCreator?: PostCreatorData;
  latestPostCreator?: PostCreatorData;

  emailSubscription: EmailSubscriptionSetting;
  permissions: ForumTopicListDataPermissions;

  nextUnreadTopicUrl: string | null;
  forumUrl: string;
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
  isAnonymous: boolean;
  creator?: { id: number; userUrl: string; name: string; imageUrl: string };
  permissions: ForumTopicPostListDataPermissions;
}

export interface ForumData extends ForumListData {
  availableTopicTypes: TopicType[];
  topicIds: number[];
  nextUnreadTopicUrl: string | null;
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
  rootForumUrl: ForumData['rootForumUrl'];
  nextUnreadTopicUrl: ForumData['nextUnreadTopicUrl'];
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
  voteCount: ForumTopicListData['voteCount'];
  postCount: ForumTopicListData['postCount'];
  viewCount: ForumTopicListData['viewCount'];

  firstPostCreator?: ForumTopicListData['firstPostCreator'];
  latestPostCreator?: ForumTopicListData['latestPostCreator'];

  emailSubscription: ForumTopicListData['emailSubscription'];
  permissions: ForumTopicListData['permissions'];

  forumUrl: ForumTopicListData['forumUrl'];
  nextUnreadTopicUrl: ForumTopicListData['nextUnreadTopicUrl'];
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
  isAnonymous: ForumTopicPostListData['isAnonymous'];
  creator?: ForumTopicPostListData['creator'];

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
  isAnonymous?: boolean;
  topicType: TopicType;
}

export interface ForumTopicPostData {
  topic: {
    title: ForumTopicFormData['title'];
    topic_type: ForumTopicFormData['topicType'];
    is_anonymous: ForumTopicFormData['isAnonymous'];
    posts_attributes: {
      text: ForumTopicFormData['text'];
      is_anonymous: ForumTopicFormData['isAnonymous'];
    }[];
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
  isAnonymous?: boolean;
}

export interface ForumTopicPostPostData {
  discussion_post: {
    text: ForumTopicPostFormData['text'];
    parent_id: ForumTopicPostFormData['parentId'];
    is_anonymous?: ForumTopicPostFormData['isAnonymous'];
  };
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
