import { CSSProperties, FC, memo, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import {
  Button,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import equal from 'fast-deep-equal';
import { TodoData } from 'types/course/lesson-plan/todos';

import PersonalStartEndTime from 'lib/components/extensions/PersonalStartEndTime';
import {
  getAssessmentAttemptURL,
  getAssessmentSubmissionURL,
  getAssessmentURL,
  getCourseURL,
  getIgnoreTodoURL,
  getSurveyResponseURL,
  getSurveyURL,
  getVideoAttemptURL,
  getVideoSubmissionsURL,
} from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';

import TodoAccessButton from '../buttons/TodoAccessButton';
import TodoIgnoreButton from '../buttons/TodoIgnoreButton';

interface Props extends WrappedComponentProps {
  todos: TodoData[];
  todoType: 'assessments' | 'videos' | 'surveys';
}

const translations = defineMessages({
  pendingAssessmentsHeader: {
    id: 'course.courses.PendingTodosTable.pendingAssessmentsHeader',
    defaultMessage: 'Pending Assessments',
  },
  pendingVideosHeader: {
    id: 'course.courses.PendingTodosTable.pendingVideosHeader',
    defaultMessage: 'Pending Videos',
  },
  pendingSurveysHeader: {
    id: 'course.courses.PendingTodosTable.pendingSurveysHeader',
    defaultMessage: 'Pending Surveys',
  },
  seeMoreFailure: {
    id: 'course.courses.PendingTodosTable.seeMoreFailure',
    defaultMessage: 'Failed to load more pending tasks',
  },
  tableHeaderTitle: {
    id: 'course.courses.PendingTodosTable.tableHeaderTitle',
    defaultMessage: 'Title',
  },
  tableHeaderStartAt: {
    id: 'course.courses.PendingTodosTable.tableHeaderStartAt',
    defaultMessage: 'Start At',
  },
  tableHeaderEndAt: {
    id: 'course.courses.PendingTodosTable.tableHeaderEndAt',
    defaultMessage: 'End At',
  },
  tableSeeMore: {
    id: 'course.courses.PendingTodosTable.tableSeeMore',
    defaultMessage: 'SEE MORE',
  },
  accessButtonRespond: {
    id: 'course.courses.PendingTodosTable.accessButtonRespond',
    defaultMessage: 'Respond',
  },
  accessButtonEnterPassword: {
    id: 'course.courses.PendingTodosTable.accessButtonEnterPassword',
    defaultMessage: 'Enter Password',
  },
  accessButtonAttempt: {
    id: 'course.courses.PendingTodosTable.accessButtonAttempt',
    defaultMessage: 'Attempt',
  },
  accessButtonResume: {
    id: 'course.courses.PendingTodosTable.accessButtonResume',
    defaultMessage: 'Resume',
  },
  accessButtonWatch: {
    id: 'course.courses.PendingTodosTable.accessButtonWatch',
    defaultMessage: 'Watch',
  },
});

const PendingTodosTable: FC<Props> = (props) => {
  const { intl, todos, todoType } = props;

  const [shavedTodos, setShavedTodos] = useState(todos.slice(0, 5));
  const [end, setEnd] = useState(10);

  useEffect(() => {
    setShavedTodos(todos.slice(0, end - 5));
  }, [todos]);

  const renderButtons = (todo: TodoData): JSX.Element => {
    let accessButtonText = '';
    let accessButtonLink = '';
    let submissionUrl;
    switch (todoType) {
      case 'surveys':
        accessButtonText = intl.formatMessage(translations.accessButtonRespond);
        if (todo.progress === 'in_progress') {
          accessButtonLink = getSurveyResponseURL(
            getCourseId(),
            todo.itemActableId,
            todo.itemActableSpecificId,
          );
        } else {
          accessButtonLink = getSurveyURL(getCourseId(), todo.itemActableId);
        }
        break;

      case 'assessments':
        if (todo.progress === 'not_started') {
          if (!todo.canAccess && todo.canAttempt) {
            accessButtonText = intl.formatMessage(
              translations.accessButtonEnterPassword,
            );
            accessButtonLink = getAssessmentURL(
              getCourseId(),
              todo.itemActableId,
            );
          } else if (todo.canAttempt) {
            accessButtonText = intl.formatMessage(
              translations.accessButtonAttempt,
            );
            accessButtonLink = getAssessmentAttemptURL(
              getCourseId(),
              todo.itemActableId,
            );
          }
        } else {
          accessButtonText = intl.formatMessage(
            translations.accessButtonResume,
          );
          accessButtonLink = `${getAssessmentSubmissionURL(
            getCourseId(),
            todo.itemActableId,
          )}/${todo.itemActableSpecificId}/edit`;
        }

        submissionUrl = getAssessmentSubmissionURL(
          getCourseId(),
          todo.itemActableId,
        );
        break;

      case 'videos':
        accessButtonText = intl.formatMessage(translations.accessButtonWatch);
        accessButtonLink = getVideoAttemptURL(
          getCourseId(),
          todo.itemActableId,
        );

        submissionUrl = getVideoSubmissionsURL(
          getCourseId(),
          todo.itemActableId,
        );
        break;
      default:
        break;
    }

    return (
      <Stack
        alignItems="center"
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="center"
        spacing={1}
      >
        <TodoAccessButton
          accessButtonLink={accessButtonLink}
          accessButtonText={accessButtonText}
          isNewAttempt={
            todo.progress === 'not_started' &&
            todo.canAccess! &&
            todo.canAttempt!
          }
          isVideo={todoType === 'videos'}
          submissionUrl={submissionUrl ?? accessButtonLink}
        />
        <TodoIgnoreButton
          ignoreLink={getIgnoreTodoURL(getCourseId(), todo.id)}
          todoId={todo.id}
          todoType={todoType}
        />
      </Stack>
    );
  };

  const getBackgroundColor = (todo: TodoData): CSSProperties => {
    let backgroundColor = '#ffffff';
    if (
      todo.endTimeInfo.effectiveTime &&
      Date.parse(todo.endTimeInfo.effectiveTime) < Date.now()
    ) {
      backgroundColor = '#ffe8e8';
    }
    return { background: backgroundColor };
  };

  let header = '';
  switch (todoType) {
    case 'assessments':
      header = intl.formatMessage(translations.pendingAssessmentsHeader);
      break;
    case 'videos':
      header = intl.formatMessage(translations.pendingVideosHeader);
      break;
    case 'surveys':
      header = intl.formatMessage(translations.pendingSurveysHeader);
      break;
    default:
      break;
  }

  const handleSeeMore = (): void => {
    setShavedTodos(todos.slice(0, end));
    setEnd(end + 5);
  };

  return (
    <>
      <h2>{header}</h2>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              {intl.formatMessage(translations.tableHeaderTitle)}
            </TableCell>
            <TableCell>
              {intl.formatMessage(translations.tableHeaderStartAt)}
            </TableCell>
            <TableCell>
              {intl.formatMessage(translations.tableHeaderEndAt)}
            </TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {shavedTodos.map((todo) => (
            <TableRow
              key={todo.id}
              id={`todo-${todo.id}`}
              style={{ ...getBackgroundColor(todo) }}
            >
              <TableCell>
                <Link
                  href={`${getCourseURL(getCourseId())}/${todoType}/${
                    todo.itemActableId
                  }`}
                  style={{ textDecoration: 'none' }}
                >
                  {todo.itemActableTitle}
                </Link>
              </TableCell>
              <TableCell>
                <PersonalStartEndTime timeInfo={todo.startTimeInfo} />
              </TableCell>
              <TableCell>
                <PersonalStartEndTime timeInfo={todo.endTimeInfo} />
              </TableCell>
              <TableCell>{renderButtons(todo)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {todos.length > shavedTodos.length && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: 10,
            marginTop: 10,
          }}
        >
          <Button onClick={handleSeeMore}>
            {`${intl.formatMessage(translations.tableSeeMore)} (${
              todos.length - shavedTodos.length
            })`}
          </Button>
        </div>
      )}
    </>
  );
};

export default memo(injectIntl(PendingTodosTable), (prevProps, nextProps) => {
  return equal(prevProps.todos, nextProps.todos);
});
