import { Button } from '@mui/material';
import CKEditorRichText from 'lib/components/CKEditorRichText';
import { FC, useEffect, useState } from 'react';
import {
  defineMessages,
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from 'react-intl';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { CommentTopicEntity } from 'types/course/comments';
import { AppDispatch } from 'types/store';
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
  const dispatch = useDispatch<AppDispatch>();
  const [value, setValue] = useState('');
  const [disableCommentButton, setDisableCommentButton] = useState(false);
  const [disableComment, setDisableComment] = useState(false);

  useEffect(() => {
    const newValue = value.replace(/<\/?[^>]+(>|$)/g, '').trim();
    if (newValue === '') {
      setDisableCommentButton(true);
    } else {
      setDisableCommentButton(false);
    }
  }, [value]);

  const createComment = (): void => {
    setDisableCommentButton(true);
    setDisableComment(true);
    dispatch(createPost(topic.id, value))
      .then(() => {
        setValue('');
        toast.success(intl.formatMessage(translations.createSuccess));
        updateStatus();
        setDisableComment(false);
      })
      .catch((error) => {
        toast.error(intl.formatMessage(translations.createFailure));
        throw error;
      });
  };

  return (
    <div id={`comment-field-${topic.id}`}>
      <CKEditorRichText
        name={intl.formatMessage(translations.comment)}
        disabled={disableComment}
        inputId={topic.id.toString()}
        value={value}
        onChange={(text: string): void => setValue(text)}
        clearOnSubmit
        width="100%"
      />
      <Button
        id={`comment-submit-${topic.id.toString()}`}
        variant="contained"
        color="primary"
        disabled={disableCommentButton}
        onClick={createComment}
        style={{ marginRight: 10, marginBottom: 10 }}
      >
        <FormattedMessage {...translations.comment} />
      </Button>
    </div>
  );
};

export default injectIntl(CommentField);
