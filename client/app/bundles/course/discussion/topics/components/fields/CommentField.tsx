import { FC, useEffect, useState } from 'react';
import {
  defineMessages,
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from 'react-intl';
import { LoadingButton } from '@mui/lab';
import { CommentTopicEntity } from 'types/course/comments';

import CKEditorRichText from 'lib/components/core/fields/CKEditorRichText';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';

import { createPost } from '../../operations';

interface Props extends WrappedComponentProps {
  topic: CommentTopicEntity;
  updateStatus: () => void;
}

const translations = defineMessages({
  comment: {
    id: 'course.discussion.topics.CommentField.comment',
    defaultMessage: 'Comment',
  },
  createFailure: {
    id: 'course.discussion.topics.CommentField.createFailure',
    defaultMessage: 'Failed to create comment.',
  },
  createSuccess: {
    id: 'course.discussion.topics.CommentField.createSuccess',
    defaultMessage: 'Successfully created comment.',
  },
});

const CommentField: FC<Props> = (props: Props) => {
  const { intl, topic, updateStatus } = props;
  const dispatch = useAppDispatch();
  const [value, setValue] = useState('');
  const [disableCommentButton, setDisableCommentButton] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const newValue = value.replace(/<\/?[^>]+(>|$)/g, '').trim();
    if (newValue === '') {
      setDisableCommentButton(true);
    } else {
      setDisableCommentButton(false);
    }
  }, [value]);

  const createComment = (): void => {
    setIsSubmitting(true);
    setDisableCommentButton(true);
    dispatch(createPost(topic.id, value))
      .then(() => {
        setValue('');
        toast.success(intl.formatMessage(translations.createSuccess));
        updateStatus();
      })
      .catch(() => {
        toast.error(intl.formatMessage(translations.createFailure));
      })
      .finally(() => {
        setDisableCommentButton(false);
        setIsSubmitting(false);
      });
  };

  return (
    <div id={`comment-field-${topic.id}`}>
      <CKEditorRichText
        disabled={isSubmitting}
        inputId={topic.id.toString()}
        name={intl.formatMessage(translations.comment)}
        onChange={(text: string): void => setValue(text)}
        value={value}
      />
      <LoadingButton
        color="primary"
        disabled={disableCommentButton}
        id={`comment-submit-${topic.id.toString()}`}
        loading={isSubmitting}
        onClick={createComment}
        style={{ marginRight: 10, marginBottom: 10 }}
        variant="contained"
      >
        <FormattedMessage {...translations.comment} />
      </LoadingButton>
    </div>
  );
};

export default injectIntl(CommentField);
