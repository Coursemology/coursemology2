import { FC } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { Avatar, Typography } from '@mui/material';
import { NotificationData } from 'types/course/notifications';

import Link from 'lib/components/core/Link';
import {
  getAchievementURL,
  getAssessmentURL,
  getForumTopicURL,
  getVideoURL,
} from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import { formatFullDateTime } from 'lib/moment';

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
    id: 'course.courses.NotificationCard.gainAchievement',
    defaultMessage: 'gained achievement',
  },
  attemptAssessment: {
    id: 'course.courses.NotificationCard.attemptAssessment',
    defaultMessage: 'attempted',
  },
  reachLevel: {
    id: 'course.courses.NotificationCard.reachLevel',
    defaultMessage: 'reached Level',
  },
  createTopic: {
    id: 'course.courses.NotificationCard.createTopic',
    defaultMessage: 'created topic',
  },
  replyForumTopic: {
    id: 'course.courses.NotificationCard.replyForumTopic',
    defaultMessage: 'replied to',
  },
  voteForumTopic: {
    id: 'course.courses.NotificationCard.voteForumTopic',
    defaultMessage: 'voted on',
  },
  watchVideo: {
    id: 'course.courses.NotificationCard.watchVideo',
    defaultMessage: 'watched',
  },
});

const NotificationCard: FC<Props> = (props) => {
  const { intl, notification } = props;

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
    <div className="flex space-x-5 p-2" id={`notification-${notification.id}`}>
      <Avatar
        alt={notification.userInfo.name}
        src={notification.userInfo.imageUrl ?? '#'}
      />

      <div>
        <Typography variant="body2">
          <Link to={notification.userInfo.userUrl}>
            {notification.userInfo.name}
          </Link>

          {` ${concatMessage} `}

          {notification.actableName && (
            <Link to={actableLink}>{notification.actableName}</Link>
          )}

          {notification.levelNumber && `${notification.levelNumber}`}
        </Typography>

        <Typography color="text.secondary" variant="caption">
          {formatFullDateTime(notification.createdAt)}
        </Typography>
      </div>
    </div>
  );
};

export default injectIntl(NotificationCard);
