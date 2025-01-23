import { defineMessages } from 'react-intl';
import { CheckCircle, CheckCircleOutline } from '@mui/icons-material';
import { Chip, IconButton, IconButtonProps } from '@mui/material';
import {
  ForumTopicEntity,
  ForumTopicPostEntity,
  TopicType,
} from 'types/course/forums';

import { POST_WORKFLOW_STATE } from 'lib/constants/sharedConstants';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { toggleForumTopicPostAnswer } from '../../operations';

interface Props extends IconButtonProps {
  topic: ForumTopicEntity;
  post: ForumTopicPostEntity;
  isAnswer: boolean;
}

const translations = defineMessages({
  updateFailure: {
    id: 'course.forum.MarkAnswerButton.updateFailure',
    defaultMessage: 'Failed to update the post - {error}',
  },
  markedAsAnswer: {
    id: 'course.forum.MarkAnswerButton.markedAsAnswer',
    defaultMessage: 'Marked as answer',
  },
  markAsAnswer: {
    id: 'course.forum.MarkAnswerButton.markAsAnswer',
    defaultMessage: 'Mark as answer',
  },
  unmarkAsAnswer: {
    id: 'course.forum.MarkAnswerButton.unmarkAsAnswer',
    defaultMessage: 'Unmark as answer',
  },
});

const MarkAnswerButton = (props: Props): JSX.Element | null => {
  const { topic, isAnswer, post } = props;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  if (topic.topicType !== TopicType.QUESTION) return null;

  if (post.isAiGenerated && post.workflowState === POST_WORKFLOW_STATE.draft)
    return null;

  if (!topic.permissions.canToggleAnswer) {
    return isAnswer ? (
      <Chip
        color="success"
        icon={<CheckCircle />}
        label={t(translations.markedAsAnswer)}
        size="small"
        variant="outlined"
      />
    ) : null;
  }

  const handleMarkAnswer = (): void => {
    dispatch(toggleForumTopicPostAnswer(post.postUrl, topic.id, post.id)).catch(
      (error) => {
        const errorMessage = error.response?.data?.errors ?? '';
        toast.error(
          t(translations.updateFailure, {
            error: errorMessage,
          }),
        );
      },
    );
  };

  return (
    <IconButton
      className="space-x-2"
      color="info"
      disableRipple
      onClick={handleMarkAnswer}
    >
      {isAnswer ? (
        <>
          <CheckCircle color="success" />
          <Chip
            className="cursor-pointer"
            label={t(translations.unmarkAsAnswer)}
            size="small"
            variant="outlined"
          />
        </>
      ) : (
        <>
          <CheckCircleOutline className="text-gray-600" />
          <Chip
            className="cursor-pointer"
            label={t(translations.markAsAnswer)}
            size="small"
            variant="outlined"
          />
        </>
      )}
    </IconButton>
  );
};

export default MarkAnswerButton;
