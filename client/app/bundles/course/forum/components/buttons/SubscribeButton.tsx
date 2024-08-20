import { FC, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useSearchParams } from 'react-router-dom';
import { Button, Switch, Tooltip } from '@mui/material';
import { EmailSubscriptionSetting } from 'types/course/forums';

import Link from 'lib/components/core/Link';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import {
  updateForumSubscription,
  updateForumTopicSubscription,
} from '../../operations';

const commonTranslations = {
  subscribe: {
    id: 'course.forum.SubscribeButton.commonTranslations.subscribe',
    defaultMessage: 'Subscribe',
  },
  unsubscribe: {
    id: 'course.forum.SubscribeButton.commonTranslations.unsubscribe',
    defaultMessage: 'Unsubscribe',
  },
  manageMySubscriptions: {
    id: 'course.forum.SubscribeButton.commonTranslations.manageMySubscription',
    defaultMessage: 'Manage My Subscriptions',
  },
  updateSubscriptionFailure: {
    id: 'course.forum.SubscribeButton.commonTranslations.updateSubscriptionFailure',
    defaultMessage: 'Failed to update subscription - {error}',
  },
};

const forumTranslations = defineMessages({
  subscribeTooltip: {
    id: 'course.forum.SubscribeButton.forumTranslations.subscribeTooltip',
    defaultMessage:
      'Subscribe to receive an email notification when a new topic is created.',
  },
  unsubscribeTooltip: {
    id: 'course.forum.SubscribeButton.forumTranslations.unsubscribeTooltip',
    defaultMessage:
      'Unsubscribe to stop receiving email notifications when a new topic is created.',
  },
  userSettingSubscribed: {
    id: 'course.forum.SubscribeButton.forumTranslations.userSettingSubscribed',
    defaultMessage:
      'You have unsubscribed from "New Topic" for forums in this course. Please go to {manageMySubscriptionLink} to enable it.',
  },
  adminSettingSubscribed: {
    id: 'course.forum.SubscribeButton.forumTranslations.adminSettingSubscribed',
    defaultMessage:
      'Subscription of new forum topic is disabled by the course admin.',
  },
  subscribeSuccess: {
    id: 'course.forum.SubscribeButton.forumTranslations.subscribeSuccess',
    defaultMessage: 'You have successfully been subscribed to {title}.',
  },
  unsubscribeSuccess: {
    id: 'course.forum.SubscribeButton.forumTranslations.unsubscribeSuccess',
    defaultMessage: 'You have successfully been unsubscribed from {title}.',
  },
});

const forumTopicTranslations = defineMessages({
  subscribeTooltip: {
    id: 'course.forum.SubscribeButton.forumTopicTranslations.subscribeTooltip',
    defaultMessage:
      'Subscribe to receive email notifications when someone replies in this forum topic.',
  },
  unsubscribeTooltip: {
    id: 'course.forum.SubscribeButton.forumTopicTranslations.unsubscribeTooltip',
    defaultMessage:
      'Unsubscribe to stop receiving email notifications when someone replies in this forum topic.',
  },
  userSettingSubscribed: {
    id: 'course.forum.SubscribeButton.forumTopicTranslations.userSettingSubscribed',
    defaultMessage:
      'You have unsubscribed from "New Post and Reply" for forums in this course. Please go to {manageMySubscriptionLink} to enable it.',
  },
  adminSettingSubscribed: {
    id: 'course.forum.SubscribeButton.forumTopicTranslations.adminSettingSubscribed',
    defaultMessage:
      'Subscription of forum topics is disabled by the course admin.',
  },
  subscribeSuccess: {
    id: 'course.forum.SubscribeButton.forumTopicTranslations.subscribeSuccess',
    defaultMessage:
      'You have successfully been subscribed to the forum topic {title}.',
  },
  unsubscribeSuccess: {
    id: 'course.forum.SubscribeButton.forumTopicTranslations.unsubscribeSuccess',
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
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'checkbox';
}

const SubscribeButton: FC<Props> = ({
  emailSubscription,
  entityType,
  entityId,
  entityUrl,
  entityTitle,
  className,
  disabled: disableButton,
  type,
}: Props) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const translations =
    entityType === 'forum' ? forumTranslations : forumTopicTranslations;
  const isSubscribed = emailSubscription.isUserSubscribed;
  const disabled =
    !emailSubscription.isCourseEmailSettingEnabled ||
    !emailSubscription.isUserEmailSettingEnabled ||
    isUpdating ||
    disableButton;

  let subscribedTooltip = t(translations.unsubscribeTooltip);
  let unsubscribedTooltip = t(translations.subscribeTooltip);

  if (!emailSubscription.isUserEmailSettingEnabled) {
    subscribedTooltip = t(translations.userSettingSubscribed, {
      manageMySubscriptionLink: (
        <Link
          opensInNewTab
          to={emailSubscription.manageEmailSubscriptionUrl ?? ''}
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
        {type === 'button' && (
          <Button
            className={`${entityType}-subscribe-${entityId} ${className ?? ''}`}
            color="inherit"
            disabled={disabled}
            onClick={handleUpdate}
            variant="outlined"
          >
            {isSubscribed
              ? t(commonTranslations.unsubscribe)
              : t(commonTranslations.subscribe)}
          </Button>
        )}
        {type === 'checkbox' && (
          <Switch
            checked={isSubscribed}
            className={`${entityType}-subscribe-${entityId}`}
            disabled={disabled}
            onChange={handleUpdate}
          />
        )}
      </span>
    </Tooltip>
  );
};

export default SubscribeButton;
