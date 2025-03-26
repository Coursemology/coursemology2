import { FC, useEffect, useState } from 'react';
import { Tooltip } from 'react-tooltip';
import {
  Card,
  CardContent,
  Chip,
  FormControlLabel,
  Palette,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { workflowStates } from 'course/assessment/submission/constants';
import submissionTranslations from 'course/assessment/submission/pages/SubmissionsIndex/translations';
import { fetchResponses } from 'course/survey/actions/responses';
import surveyTranslations from 'course/survey/translations';
import BarChart from 'lib/components/core/BarChart';
import CourseUserTypeTabs, {
  CourseUserType,
  CourseUserTypeTabValue,
  getCurrentSelectedUserType,
} from 'lib/components/core/CourseUserTypeTabs';
import Link from 'lib/components/core/Link';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';
import moment, { formatLongDateTime } from 'lib/moment';

import withSurveyLayout from '../../containers/SurveyLayout';
import UnsubmitButton from '../../containers/UnsubmitButton';

import RemindButton from './RemindButton';
import translations from './translations';

enum ResponseStatus {
  NOT_STARTED = 'NOT_STARTED',
  SUBMITTED = 'SUBMITTED',
  RESPONDING = 'RESPONDING',
}

interface ResponseIndexProps {
  survey: {
    anonymous: boolean;
    start_at: string;
    end_at: string;
    closing_reminded_at?: string;
  };
}

interface ResponseWithStatus {
  canUnsubmit: boolean;
  course_user: {
    id: number;
    name: string;
    path: string;
    phantom: boolean;
    isStudent: boolean;
    myStudent?: boolean;
  };
  id: number;
  path: string;
  present: boolean;
  status: ResponseStatus;
  submitted_at: string;
}

type PaletteWithSubmissionStatus = Palette & {
  submissionStatus: {
    [workflowStates.Unstarted]: string;
    [workflowStates.Attempting]: string;
    [workflowStates.Submitted]: string;
  };
  submissionStatusClassName: {
    [workflowStates.Unstarted]: string;
    [workflowStates.Attempting]: string;
    [workflowStates.Submitted]: string;
  };
  submissionIcon: {
    unsubmit: string;
  };
};
type ResponseFilter = (response: ResponseWithStatus) => boolean;

const ResponseIndex: FC<ResponseIndexProps> = (props) => {
  const dispatch = useAppDispatch();
  const { isLoading, responses } = useAppSelector(
    (state) => state.surveys.responses,
  );
  const { survey } = props;
  const { t } = useTranslation();
  const responseStatusLabelMapper = {
    [ResponseStatus.NOT_STARTED]: t(translations.notStarted),
    [ResponseStatus.RESPONDING]: t(translations.responding),
    [ResponseStatus.SUBMITTED]: t(translations.submitted),
  };

  const { palette } = useTheme<{ palette: PaletteWithSubmissionStatus }>();
  const dataColorMapper = {
    [ResponseStatus.NOT_STARTED]:
      palette.submissionStatus[workflowStates.Unstarted],
    [ResponseStatus.RESPONDING]:
      palette.submissionStatus[workflowStates.Attempting],
    [ResponseStatus.SUBMITTED]:
      palette.submissionStatus[workflowStates.Submitted],
  };
  const dataClassNameMapper = {
    [ResponseStatus.NOT_STARTED]:
      palette.submissionStatusClassName[workflowStates.Unstarted],
    [ResponseStatus.RESPONDING]:
      palette.submissionStatusClassName[workflowStates.Attempting],
    [ResponseStatus.SUBMITTED]:
      palette.submissionStatusClassName[workflowStates.Submitted],
  };
  const [isIncludingPhantoms, setIsIncludingPhantoms] = useState(true);
  const [tab, setTab] = useState<CourseUserTypeTabValue>(
    CourseUserTypeTabValue.MY_STUDENTS_TAB,
  );

  useEffect(() => {
    dispatch(fetchResponses());
  }, [dispatch]);

  const responseFilterMapper: Record<CourseUserType, ResponseFilter> = {
    [CourseUserType.MY_STUDENTS]: (response) =>
      !response.course_user.phantom &&
      response.course_user.isStudent &&
      Boolean(response.course_user.myStudent),
    [CourseUserType.MY_STUDENTS_W_PHANTOM]: (response) =>
      response.course_user.isStudent && Boolean(response.course_user.myStudent),
    [CourseUserType.STUDENTS]: (response) =>
      !response.course_user.phantom && response.course_user.isStudent,
    [CourseUserType.STUDENTS_W_PHANTOM]: (response) =>
      response.course_user.isStudent,
    [CourseUserType.STAFF]: (response) =>
      !response.course_user.phantom && !response.course_user.isStudent,
    [CourseUserType.STAFF_W_PHANTOM]: (response) =>
      !response.course_user.isStudent,
  };

  const currentSelectedUserType = getCurrentSelectedUserType(
    tab,
    isIncludingPhantoms,
  );

  const myStudentsExist = isIncludingPhantoms
    ? responses.some(responseFilterMapper[CourseUserType.MY_STUDENTS_W_PHANTOM])
    : responses.some(responseFilterMapper[CourseUserType.MY_STUDENTS]);

  useEffect(() => {
    if (tab === CourseUserTypeTabValue.MY_STUDENTS_TAB && !myStudentsExist) {
      setTab(CourseUserTypeTabValue.STUDENTS_TAB);
    }
  }, [dispatch, myStudentsExist]);

  const isShowingRemindButton = tab !== CourseUserTypeTabValue.STAFF_TAB;

  const computeResponseStatus = (
    response: Omit<ResponseWithStatus, 'status'>,
  ): ResponseStatus => {
    if (!response.present) {
      return ResponseStatus.NOT_STARTED;
    }
    if (response.submitted_at) {
      return ResponseStatus.SUBMITTED;
    }
    return ResponseStatus.RESPONDING;
  };

  const computeStatuses = (
    computeResponses: Omit<ResponseWithStatus, 'status'>[],
  ): ResponseWithStatus[] =>
    computeResponses.map((response) => ({
      ...response,
      status: computeResponseStatus(response),
    }));

  const renderUpdatedAt = (response): null | string | JSX.Element => {
    if (!response.submitted_at) {
      return null;
    }
    const updatedAt = formatLongDateTime(response.updated_at);
    if (survey.end_at && moment(response.updated_at).isAfter(survey.end_at)) {
      return <div className="text-red-500"> {updatedAt}</div>;
    }
    return updatedAt;
  };

  const renderResponseStatus = (response: ResponseWithStatus): JSX.Element => {
    const status = responseStatusLabelMapper[response.status];
    const colorClassName = survey.anonymous
      ? palette.submissionStatusClassName[ResponseStatus.SUBMITTED] // grey colour
      : dataClassNameMapper[response.status];
    const isLink =
      response.status !== ResponseStatus.NOT_STARTED && !survey.anonymous;

    return (
      <Chip
        className={`w-fit ${colorClassName} ${isLink ? 'text-blue-800' : ''}`}
        clickable={isLink}
        label={isLink ? <Link to={response.path}>{status}</Link> : status}
        variant="filled"
      />
    );
  };

  const renderSubmittedAt = (response): null | string | JSX.Element => {
    if (!response.submitted_at) {
      return null;
    }
    const submittedAt = formatLongDateTime(response.submitted_at);
    if (survey.end_at && moment(response.submitted_at).isAfter(survey.end_at)) {
      return <div className="text-red-500">{submittedAt}</div>;
    }
    return submittedAt;
  };

  const renderTable = (tableResponses: ResponseWithStatus[]): JSX.Element => (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell colSpan={2}>{t(translations.name)}</TableCell>
          <TableCell>{t(translations.responseStatus)}</TableCell>
          <TableCell>{t(translations.submittedAt)}</TableCell>
          <TableCell>{t(translations.updatedAt)}</TableCell>
          <TableCell />
        </TableRow>
      </TableHead>
      <TableBody>
        {tableResponses.map((response) => (
          <TableRow key={response.course_user.id}>
            <TableCell colSpan={2}>
              <Link to={response.course_user.path}>
                {response.course_user.name}
              </Link>
            </TableCell>
            <TableCell>{renderResponseStatus(response)}</TableCell>
            <TableCell>{renderSubmittedAt(response)}</TableCell>
            <TableCell>{renderUpdatedAt(response)}</TableCell>
            <TableCell>
              {response.status === ResponseStatus.SUBMITTED &&
              response.canUnsubmit ? (
                <UnsubmitButton
                  color={palette.submissionIcon.unsubmit}
                  isIcon
                  responseId={response.id}
                />
              ) : null}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderPhantomTable = (
    tableResponses: ResponseWithStatus[],
  ): null | JSX.Element => {
    if (tableResponses.length < 1) {
      return null;
    }

    return (
      <div>
        <h1>{t(translations.phantoms)}</h1>
        {renderTable(tableResponses)}
      </div>
    );
  };

  const renderStats = (
    statusCountMapper: Record<ResponseStatus, number>,
  ): JSX.Element => {
    const chartData = [
      ResponseStatus.NOT_STARTED,
      ResponseStatus.RESPONDING,
      ResponseStatus.SUBMITTED,
    ].map((data) => ({
      count: statusCountMapper[data],
      color: dataColorMapper[data],
      label: responseStatusLabelMapper[data],
    }));

    return (
      <Card className="mb-10">
        <CardContent>
          <CourseUserTypeTabs
            myStudentsExist={myStudentsExist}
            onChange={(_, value) => setTab(value)}
            value={tab}
          />
          <FormControlLabel
            control={
              <Switch
                checked={isIncludingPhantoms}
                color="primary"
                onChange={(_, value) => setIsIncludingPhantoms(value)}
              />
            }
            label={<b>{t(submissionTranslations.includePhantoms)}</b>}
          />
          <BarChart data={chartData} />
          <br />
          {isShowingRemindButton && (
            <RemindButton userType={currentSelectedUserType} />
          )}
        </CardContent>
      </Card>
    );
  };

  const computeStatusCounts = (
    responsesWithStatuses: ResponseWithStatus[],
  ): Record<ResponseStatus, number> => ({
    [ResponseStatus.NOT_STARTED]: responsesWithStatuses.filter(
      (response) => response.status === ResponseStatus.NOT_STARTED,
    ).length,
    [ResponseStatus.RESPONDING]: responsesWithStatuses.filter(
      (response) => response.status === ResponseStatus.RESPONDING,
    ).length,
    [ResponseStatus.SUBMITTED]: responsesWithStatuses.filter(
      (response) => response.status === ResponseStatus.SUBMITTED,
    ).length,
  });

  const renderBody = (): JSX.Element => {
    if (isLoading) {
      return <LoadingIndicator />;
    }

    const responsesWithStatuses = computeStatuses(
      responses.filter(responseFilterMapper[currentSelectedUserType]),
    );
    const realResponsesWithStatuses = responsesWithStatuses.filter(
      (response) => !response.course_user.phantom,
    );
    const phantomResponsesWithStatuses = responsesWithStatuses.filter(
      (response) => response.course_user.phantom,
    );

    return (
      <div>
        {renderStats(computeStatusCounts(responsesWithStatuses))}
        {renderTable(realResponsesWithStatuses)}
        {renderPhantomTable(phantomResponsesWithStatuses)}

        <Tooltip id="unsubmit-button">{t(translations.unsubmit)}</Tooltip>
      </div>
    );
  };

  const renderHeader = (): JSX.Element => (
    <Card className="mb-10">
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>{t(surveyTranslations.startsAt)}</TableCell>
            <TableCell>{formatLongDateTime(survey.start_at)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>{t(surveyTranslations.endsAt)}</TableCell>
            <TableCell>{formatLongDateTime(survey.end_at)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>{t(surveyTranslations.closingRemindedAt)}</TableCell>
            <TableCell>
              {survey.closing_reminded_at
                ? formatLongDateTime(survey.closing_reminded_at)
                : '-'}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  );

  return (
    <div>
      {renderHeader()}
      {renderBody()}
    </div>
  );
};

const handle = translations.responses;

export default Object.assign(withSurveyLayout(ResponseIndex), { handle });
