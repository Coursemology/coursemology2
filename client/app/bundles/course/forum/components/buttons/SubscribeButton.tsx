import { FC, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { NotificationsActive, NotificationsOff } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { EmailSubscriptionSetting } from 'types/course/forums';
import { AppDispatch } from 'types/store';

import Link from 'lib/components/core/Link';
import useTranslation from 'lib/hooks/useTranslation';

import {
  updateForumSubscription,
  updateForumTopicSubscription,
} from '../../operations';

const commonTranslations = {
  manageMySubscriptions: {
    id: 'course.forum.components.buttons.subcribeButton.manageMySubscription',
    defaultMessage: 'Manage My Subscriptions',
  },
  updateSubscriptionFailure: {
    id: 'course.forum.components.buttons.subcribeButton.updateSubscriptionFailure',
    defaultMessage: 'Failed to update subscription - {error}',
  },
};

const forumTranslations = defineMessages({
  subscribeTag: {
    id: 'course.forum.components.buttons.subcribeButton.subscribeTag',
    defaultMessage:
      'Subscribe to receive an email notification when a new topic is created.',
  },
  unsubscribeTag: {
    id: 'course.forum.components.buttons.subcribeButton.unsubscribeTag',
    defaultMessage:
      'Unsubscribe to stop receiving email notifications when a new topic is created.',
  },
  userSettingSubscribed: {
    id: 'course.forum.components.buttons.subcribeButton.userSettingSubscribed',
    defaultMessage:
      'You have unsubscribed from "New Topic" for forums in this course. Please go to {manageMySubscriptionLink} to enable it.',
  },
  adminSettingSubscribed: {
    id: 'course.forum.components.buttons.subcribeButton.adminSettingSubscribed',
    defaultMessage:
      'Subscription of new forum topic is disabled by the course admin.',
  },
  subscribeSuccess: {
    id: 'course.forum.components.buttons.subcribeButton.subscribeSuccess',
    defaultMessage: 'You have successfully been subscribed to {title}.',
  },
  unsubscribeSuccess: {
    id: 'course.forum.components.buttons.subcribeButton.unsubscribeSuccess',
    defaultMessage: 'You have successfully been unsubscribed from {title}.',
  },
});

const forumTopicTranslations = defineMessages({
  subscribeTag: {
    id: 'course.forum.topic.components.buttons.subcribeButton.subscribeTag',
    defaultMessage:
      'Subscribe to receive email notifications when someone replies in this forum topic.',
  },
  unsubscribeTag: {
    id: 'course.forum.topic.components.buttons.subcribeButton.unsubscribeTag',
    defaultMessage:
      'Unsubscribe to stop receiving email notifications when someone replies in this forum topic.',
  },
  userSettingSubscribed: {
    id: 'course.forum.topic.components.buttons.subcribeButton.userSettingSubscribed',
    defaultMessage:
      'You have unsubscribed from "New Post and Reply" for forums in this course. Please go to {manageMySubscriptionLink} to enable it.',
  },
  adminSettingSubscribed: {
    id: 'course.forum.topic.components.buttons.subcribeButton.adminSettingSubscribed',
    defaultMessage:
      'Subscription of forum topics is disabled by the course admin.',
  },
  subscribeSuccess: {
    id: 'course.forum.topic.components.buttons.subcribeButton.subscribeSuccess',
    defaultMessage:
      'You have successfully been subscribed to the forum topic {title}.',
  },
  unsubscribeSuccess: {
    id: 'course.forum.topic.components.buttons.subcribeButton.unsubscribeSuccess',
    defaultMessage:
      'You have successfully been unsubscribed from the forum topic {title}.',
  },
});

interface Props {
  emailSubscription: EmailSubscriptionSetting;
  entityType: 'forum' | 'topic';
  entityId: number;
  entityUrl: string;
  entityTitle: string;
  disabled?: boolean;
}

const SubscribeButton: FC<Props> = ({
  emailSubscription,
  entityType,
  entityId,
  entityUrl,
  entityTitle,
  disabled: disableButton,
}: Props) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const translations =
    entityType === 'forum' ? forumTranslations : forumTopicTranslations;
  const isSubscribed = emailSubscription.isUserSubscribed;
  const disabled =
    !emailSubscription.isCourseEmailSettingEnabled ||
    !emailSubscription.isUserEmailSettingEnabled ||
    isUpdating ||
    disableButton;

  let subscribedTooltip = t(translations.unsubscribeTag);
  let unsubscribedTooltip = t(translations.subscribeTag);

  if (!emailSubscription.isUserEmailSettingEnabled) {
    subscribedTooltip = t(translations.userSettingSubscribed, {
      manageMySubscriptionLink: (
        <Link
          href={emailSubscription.manageEmailSubscriptionUrl ?? ''}
          opensInNewTab
        >
          {t(commonTranslations.manageMySubscriptions)}
        </Link>
      ),
    });
    unsubscribedTooltip = subscribedTooltip;
  }

  if (!emailSubscription.isCourseEmailSettingEnabled) {
    subscribedTooltip = t(translations.adminSettingSubscribed);
    unsubscribedTooltip = t(translations.adminSettingSubscribed);
  }
  const handleUpdate = (): Promise<void> => {
    setIsUpdating(true);
    return dispatch(
      entityType === 'forum'
        ? updateForumSubscription(
            entityId,
            entityUrl,
            emailSubscription.isUserSubscribed,
          )
        : updateForumTopicSubscription(
            entityId,
            entityUrl,
            emailSubscription.isUserSubscribed,
          ),
    )
      .then(() => {
        toast.success(
          isSubscribed
            ? t(translations.unsubscribeSuccess, {
                title: entityTitle,
              })
            : t(translations.subscribeSuccess, {
                title: entityTitle,
              }),
        );
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          t(commonTranslations.updateSubscriptionFailure, {
            error: errorMessage,
          }),
        );
      })
      .finally(() => setIsUpdating(false));
  };

  const [searchParams] = useSearchParams();

  // The following useEffect is to handle unsubscription triggerred from
  // a user's email notification. The link from the email includes
  // params of either subscribe_topic or subscribe_forum.
  // When these params are detected, the following logic would either
  // call handleUpdate in order to trigger unsubscription to the backend,
  // or if the topic/forum has already been unsubscribed, we do not trigger
  // any backend call and we just show a success toast message.
  useEffect(() => {
    // In a forum topic table rendered in the ForumShow page,
    // there could be multiple SubscribeButton elements
    // belonging to either the forum itself or the the individual topics inside the table.
    // As we only want to trigger only the relevant unsubscription, we check the params key
    // , of either subscribe_forum or subscribe_topic, with the entityType of the button.
    if (
      searchParams.get('subscribe_forum') === 'false' &&
      entityType === 'forum'
    ) {
      if (!emailSubscription.isUserSubscribed) {
        toast.success(
          t(translations.unsubscribeSuccess, {
            title: entityTitle,
          }),
        );
      } else {
        handleUpdate();
      }
    }

    if (
      searchParams.get('subscribe_topic') === 'false' &&
      entityType === 'topic'
    ) {
      if (!emailSubscription.isUserSubscribed) {
        toast.success(
          t(translations.unsubscribeSuccess, {
            title: entityTitle,
          }),
        );
      } else {
        handleUpdate();
      }
    }
  }, [searchParams]);

  return (
    <Tooltip title={isSubscribed ? subscribedTooltip : unsubscribedTooltip}>
      <span>
        <IconButton
          className={`${entityType}-subscribe-${entityId}`}
          color="inherit"
          disabled={disabled}
          onClick={handleUpdate}
        >
          {isSubscribed ? <NotificationsOff /> : <NotificationsActive />}
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default SubscribeButton;
