import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { FC } from 'react';
import { NotificationData } from 'types/course/notifications';
import { Avatar } from '@mui/material';
import {
  getAchievementURL,
  getAssessmentURL,
  getCourseUserURL,
  getForumTopicURL,
  getUserURL,
  getVideoURL,
} from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import { getFullDateTime } from 'lib/helpers/timehelper';

interface Props extends WrappedComponentProps {
  notification: NotificationData;
}

/*
The 7 notifications
1. Gaining achievement          '%{user} gained achievement %{achievement}'
2. Attempted assessment         '%{user} attempted %{assessment}'
3. Reached level                '%{user} reached level %{level_number}'
4. Create forum topic           '%{user} created topic %{topic}'
5. Reply to forum topic         '%{user} replied to %{topic}'
6. Voting...? on forum topic    '%{user} voted on %{topic}'
7. Watched a video              '%{user} watched %{video}'
*/

const translations = defineMessages({
  gainAchievement: {
    id: 'course.courses.show.notification.gainAchievement',
    defaultMessage: 'gained achievement',
  },
  attemptAssessment: {
    id: 'course.courses.show.notification.attemptAssessment',
    defaultMessage: 'attempted',
  },
  reachLevel: {
    id: 'course.courses.show.notification.reachLevel',
    defaultMessage: 'reached Level',
  },
  createTopic: {
    id: 'course.courses.show.notification.createTopic',
    defaultMessage: 'created topic',
  },
  replyForumTopic: {
    id: 'course.courses.show.notification.replyForumTopic',
    defaultMessage: 'replied to',
  },
  voteForumTopic: {
    id: 'course.courses.show.notification.voteForumTopic',
    defaultMessage: 'voted on',
  },
  watchVideo: {
    id: 'course.courses.show.notification.watchVideo',
    defaultMessage: 'watched',
  },
});

const NotificationCard: FC<Props> = (props) => {
  const { intl, notification } = props;

  let userLink = getCourseUserURL(getCourseId(), notification.userInfo.id);
  if (!notification.isCourseUser) {
    userLink = getUserURL(notification.userInfo.id);
  }

  let actableLink = '';
  let concatMessage = '';

  switch (notification.actableType) {
    case 'achievement':
      concatMessage = intl.formatMessage(translations.gainAchievement);
      actableLink = getAchievementURL(getCourseId(), notification.actableId);
      break;
    case 'assessment':
      concatMessage = intl.formatMessage(translations.attemptAssessment);
      actableLink = getAssessmentURL(getCourseId(), notification.actableId);
      break;
    case 'level':
      concatMessage = intl.formatMessage(translations.reachLevel);
      break;
    case 'topicCreate':
      concatMessage = intl.formatMessage(translations.createTopic);
      actableLink = getForumTopicURL(
        getCourseId(),
        notification.forumName,
        notification.topicName,
      );
      break;
    case 'topicReply':
      concatMessage = intl.formatMessage(translations.replyForumTopic);
      actableLink = `${getForumTopicURL(
        getCourseId(),
        notification.forumName,
        notification.topicName,
      )}#${notification.anchor}`;
      break;
    case 'topicVote':
      concatMessage = intl.formatMessage(translations.voteForumTopic);
      actableLink = getForumTopicURL(
        getCourseId(),
        notification.forumName,
        notification.topicName,
      );
      break;
    case 'video':
      concatMessage = intl.formatMessage(translations.watchVideo);
      actableLink = getVideoURL(getCourseId(), notification.actableId);
      break;
    default:
      break;
  }

  return (
    <div
      id={`notification-${notification.id}`}
      style={{ padding: 5, display: 'flex' }}
    >
      <Avatar
        src={notification.userInfo.imageUrl}
        sx={{ marginRight: '10px' }}
      />
      <div>
        <div>
          <a href={userLink}>{notification.userInfo.name}</a>
          {` ${concatMessage} `}
          {notification.actableName && (
            <a href={actableLink}>{notification.actableName}</a>
          )}
          {notification.levelNumber && `${notification.levelNumber}`}
        </div>
        <i style={{ fontWeight: 'lighter' }}>
          {getFullDateTime(notification.createdAt)}
        </i>
      </div>
    </div>
  );
};

export default injectIntl(NotificationCard);
