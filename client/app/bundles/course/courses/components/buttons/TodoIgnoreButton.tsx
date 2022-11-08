import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { FC } from 'react';
import { Button } from '@mui/material';
import { toast } from 'react-toastify';
import { getCourseId } from 'lib/helpers/url-helpers';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'types/store';
import { removeTodo } from '../../operations';

interface Props extends WrappedComponentProps {
  ignoreLink: string;
  todoType: 'assessments' | 'videos' | 'surveys';
  todoId: number;
}

const translations = defineMessages({
  ignoreSuccess: {
    id: 'course.todo.ignore.success',
    defaultMessage: 'Pending task successfully ignored',
  },
  ignoreFailure: {
    id: 'course.todo.ignore.failure',
    defaultMessage: 'An error occured',
  },
  ignoreButtonText: {
    id: 'course.todo.ignore.ignoreButtonText',
    defaultMessage: 'Ignore',
  },
});

const TodoIgnoreButton: FC<Props> = (props) => {
  const { intl, ignoreLink, todoType, todoId } = props;
  const dispatch = useDispatch<AppDispatch>();

  const onIgnore = (): Promise<void> => {
    const courseId = getCourseId()!;
    return dispatch(removeTodo(ignoreLink, +courseId, todoType, todoId))
      .then(() => {
        toast.success(intl.formatMessage(translations.ignoreSuccess));
      })
      .catch(() => {
        toast.error(intl.formatMessage(translations.ignoreFailure));
      });
  };

  return (
    <Button
      id={`todo-ignore-button-${todoId}`}
      variant="outlined"
      color="secondary"
      onClick={(): void => {
        onIgnore();
      }}
      style={{ width: 80 }}
    >
      {intl.formatMessage(translations.ignoreButtonText)}
    </Button>
  );
};

export default injectIntl(TodoIgnoreButton);
