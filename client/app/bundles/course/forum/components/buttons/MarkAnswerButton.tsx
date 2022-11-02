import { FC, SyntheticEvent } from 'react';
import { IconButton, IconButtonProps } from '@mui/material';
import Check from '@mui/icons-material/Check';
import Clear from '@mui/icons-material/Clear';
import { ForumTopicEntity, TopicType } from 'types/course/forums';
import { defineMessages } from 'react-intl';
import useTranslation from 'lib/hooks/useTranslation';

interface Props extends IconButtonProps {
  topic?: ForumTopicEntity;
  handleClick: (e: SyntheticEvent) => void;
  isAnswer: boolean;
}

const translations = defineMessages({
  markAsAnswer: {
    id: 'course.forum.components.buttons.markAnswerButton.markAsAnswer',
    defaultMessage: 'Mark as Answer',
  },
  unmarkAsAnswer: {
    id: 'course.forum.components.buttons.markAnswerButton.unmarkAsAnswer',
    defaultMessage: 'Unmark as Answer',
  },
});

const MarkAnswerButton: FC<Props> = ({ topic, handleClick, isAnswer }) => {
  const { t } = useTranslation();
  if (
    !topic ||
    topic.topicType !== TopicType.QUESTION ||
    !topic.permissions.canResolveTopic
  )
    return null;

  return (
    <IconButton
      onClick={handleClick}
      color="info"
      title={
        isAnswer ? t(translations.unmarkAsAnswer) : t(translations.markAsAnswer)
      }
    >
      {isAnswer ? <Clear /> : <Check />}
    </IconButton>
  );
};

export default MarkAnswerButton;
