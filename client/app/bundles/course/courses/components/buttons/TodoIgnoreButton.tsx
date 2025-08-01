import { FC } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { Button } from '@mui/material';

import { getCourseId } from 'lib/helpers/url-helpers';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';

import { removeTodo } from '../../operations';

interface Props extends WrappedComponentProps {
  ignoreLink: string;
  todoType: 'assessments' | 'videos' | 'surveys';
  todoId: number;
}

const translations = defineMessages({
  ignoreSuccess: {
    id: 'course.courses.TodoIgnoreButton.ignoreSuccess',
    defaultMessage: 'Pending task successfully ignored',
  },
  ignoreFailure: {
    id: 'course.courses.TodoIgnoreButton.ignoreFailure',
    defaultMessage: 'An error occurred',
  },
  ignoreButtonText: {
    id: 'course.courses.TodoIgnoreButton.ignore.ignoreButtonText',
    defaultMessage: 'Ignore',
  },
});

const TodoIgnoreButton: FC<Props> = (props) => {
  const { intl, ignoreLink, todoType, todoId } = props;
  const dispatch = useAppDispatch();

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
      onClick={onIgnore}
    >
      {intl.formatMessage(translations.ignoreButtonText)}
    </Button>
  );
};

export default injectIntl(TodoIgnoreButton);
