import { useState } from 'react';
import { defineMessages } from 'react-intl';
import { CheckCircleOutline } from '@mui/icons-material';
import { Chip, IconButton, IconButtonProps, Tooltip } from '@mui/material';
import {
  ForumTopicEntity,
  ForumTopicPostEntity,
  TopicType,
} from 'types/course/forums';

import { POST_WORKFLOW_STATE } from 'lib/constants/sharedConstants';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import {
  markForumTopicPostAnswerAndPublish,
  publishPost,
} from '../../operations';

interface Props extends IconButtonProps {
  topic: ForumTopicEntity;
  post: ForumTopicPostEntity;
  save?: () => void;
}

const translations = defineMessages({
  updateFailure: {
    id: 'course.forum.MarkAnswerButton.updateFailure',
    defaultMessage: 'Failed to update the post - {error}',
  },
  markAsAnswerAndPublish: {
    id: 'course.forum.MarkAnswerButton.markAsAnswerAndPublish',
    defaultMessage: 'Mark as answer and publish',
  },
  markAsAnswerAndPublishTooltip: {
    id: 'course.forum.MarkAnswerButton.markAsAnswerAndPublishTooltip',
    defaultMessage: 'Mark as answer and publish for students to view',
  },
  publish: {
    id: 'course.forum.publishButton.publish',
    defaultMessage: 'Publish',
  },
  publishTooltip: {
    id: 'course.forum.publishButton.publishTooltip',
    defaultMessage: 'Pusblish post to students',
  },
  publishSuccess: {
    id: 'course.forum.publishButton.publishSuccess',
    defaultMessage: 'The post has succesfully been published.',
  },
  publishFailure: {
    id: 'course.forum.publishButton.publishFailure',
    defaultMessage: 'Failed to publish the post.',
  },
});

const MarkAnswerAndPublishButton = (props: Props): JSX.Element | null => {
  const [isLoading, setIsLoading] = useState(false);
  const { topic, post, save } = props;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  if (
    !topic.permissions.canManageAIResponse ||
    post.workflowState !== POST_WORKFLOW_STATE.draft
  )
    return null;

  const handleMarkAnswerAndPublish = (): void => {
    save?.();
    dispatch(
      markForumTopicPostAnswerAndPublish(post.postUrl, topic.id, post.id),
    ).catch((error) => {
      const errorMessage = error.response?.data?.errors ?? '';
      toast.error(
        t(translations.updateFailure, {
          error: errorMessage,
        }),
      );
    });
  };

  const handlePublish = (): Promise<void> => {
    setIsLoading(true);
    return dispatch(publishPost(post.id, post.postUrl))
      .then(() => {
        save?.();
        toast.success(t(translations.publishSuccess));
      })
      .catch(() => {
        toast.error(t(translations.publishFailure));
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  if (topic.topicType === TopicType.QUESTION) {
    return (
      <Tooltip title={t(translations.markAsAnswerAndPublishTooltip)}>
        <IconButton
          className="space-x-2"
          color="info"
          disableRipple
          onClick={handleMarkAnswerAndPublish}
        >
          <>
            <CheckCircleOutline className="text-gray-600" />
            <Chip
              className="cursor-pointer"
              label={t(translations.markAsAnswerAndPublish)}
              size="small"
              variant="outlined"
            />
          </>
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={t(translations.publishTooltip)}>
      <Chip
        color="primary"
        disabled={isLoading}
        label={t(translations.publish)}
        onClick={handlePublish}
        size="small"
      />
    </Tooltip>
  );
};

export default MarkAnswerAndPublishButton;
