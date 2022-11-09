import { FC } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Button } from '@mui/material';
import { AppDispatch } from 'types/store';

import { getCourseId } from 'lib/helpers/url-helpers';

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
      color="secondary"
      id={`todo-ignore-button-${todoId}`}
      onClick={(): void => {
        onIgnore();
      }}
      style={{ width: 80 }}
      variant="outlined"
    >
      {intl.formatMessage(translations.ignoreButtonText)}
    </Button>
  );
};

export default injectIntl(TodoIgnoreButton);
