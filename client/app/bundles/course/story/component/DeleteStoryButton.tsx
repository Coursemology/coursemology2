import { useState } from 'react';
import { defineMessages } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import CourseAPI from 'api/course';
import DeleteButton from 'lib/components/core/buttons/DeleteButton';
import { PromptText } from 'lib/components/core/dialogs/Prompt';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  deleteStory: {
    id: 'course.story.show.deleteStory',
    defaultMessage: 'Delete Story',
  },
  sureDeletingStory: {
    id: 'course.story.show.sureDeletingStory',
    defaultMessage: "Sure you're deleting this story?",
  },
  deletingThisStory: {
    id: 'course.story.show.deletingThisStory',
    defaultMessage: 'You are about to delete the following story:',
  },
  deleteStoryWarning: {
    id: 'course.story.show.deleteStoryWarning',
    defaultMessage:
      'All existing rooms for this story will also be deleted. This action cannot be undone!',
  },
  deletingStory: {
    id: 'course.story.show.deletingStory',
    defaultMessage: 'No going back now. Deleting this story...',
  },
  storyDeleted: {
    id: 'course.story.show.storyDeleted',
    defaultMessage: 'Story successfully deleted.',
  },
  errorDeletingStory: {
    id: 'course.story.show.errorDeletingStory',
    defaultMessage: 'An error occurred when deleting this story.',
  },
});

interface DeleteStoryButtonProps {
  id: number;
  title: string;
  disabled?: boolean;
}

const DeleteStoryButton = (props: DeleteStoryButtonProps): JSX.Element => {
  const [deleting, setDeleting] = useState(false);

  const { t } = useTranslation();
  const navigate = useNavigate();

  const deleteStory = async (): Promise<void> => {
    setDeleting(true);

    try {
      await toast.promise(CourseAPI.stories.stories.delete(props.id), {
        pending: t(translations.deletingStory),
        success: t(translations.storyDeleted),
      });

      navigate('..');
    } catch (error) {
      if (!(error instanceof Error)) throw error;

      toast.error(error.message || t(translations.errorDeletingStory));
      setDeleting(false);
    }
  };

  return (
    <DeleteButton
      aria-label={t(translations.deleteStory)}
      confirmLabel={t(translations.deleteStory)}
      disabled={props.disabled || deleting}
      onClick={deleteStory}
      title="Are you sure you want to delete this story?"
      tooltip={t(translations.deleteStory)}
    >
      <PromptText>{t(translations.deletingThisStory)}</PromptText>
      <PromptText className="italic">{props.title}</PromptText>
      <PromptText>{t(translations.deleteStoryWarning)}</PromptText>
    </DeleteButton>
  );
};

export default DeleteStoryButton;
