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
import { fetchResponses } from 'course/survey/actions/responses';
import surveyTranslations from 'course/survey/translations';
import BarChart from 'lib/components/core/BarChart';
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
  };
  id: number;
  path: string;
  status: ResponseStatus;
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

const ResponseIndex: FC<ResponseIndexProps> = (props) => {
  const dispatch = useAppDispatch();
  const { isLoading, responses } = useAppSelector(
    (state) => state.surveys.responses,
  );
  const { survey } = props;
  const { t } = useTranslation();

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
  const [state, setState] = useState({
    includePhantomsInStats: false,
  });

  useEffect(() => {
    dispatch(fetchResponses());
  }, [dispatch]);

  const computeStatuses = (
    computeResponses,
  ): {
    responses: ResponseWithStatus[];
    summary: Record<ResponseStatus, number>;
  } => {
    const summary = {
      [ResponseStatus.NOT_STARTED]: 0,
      [ResponseStatus.SUBMITTED]: 0,
      [ResponseStatus.RESPONDING]: 0,
    };
    const responsesWithStatuses: ResponseWithStatus[] = [];
    const updateStatus = (
      response: Omit<ResponseWithStatus, 'status'>,
      status: ResponseStatus,
    ): void => {
      summary[status] += 1;
      responsesWithStatuses.push({ ...response, status });
    };
    computeResponses.forEach((response) => {
      if (!response.present) {
        updateStatus(response, ResponseStatus.NOT_STARTED);
      } else if (response.submitted_at) {
        updateStatus(response, ResponseStatus.SUBMITTED);
      } else {
        updateStatus(response, ResponseStatus.RESPONDING);
      }
    });

    return { responses: responsesWithStatuses, summary };
  };

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
    const status = t(translations[response.status]);
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
    realResponsesStatuses: Record<ResponseStatus, number>,
    phantomResponsesStatuses: Record<ResponseStatus, number>,
  ): JSX.Element => {
    const chartData = [
      ResponseStatus.NOT_STARTED,
      ResponseStatus.RESPONDING,
      ResponseStatus.SUBMITTED,
    ].map((data) => {
      const count = state.includePhantomsInStats
        ? realResponsesStatuses[data] + phantomResponsesStatuses[data]
        : realResponsesStatuses[data];
      return {
        count,
        color: dataColorMapper[data],
        label: t(translations[data]),
      };
    });

    return (
      <Card className="mb-10">
        <CardContent>
          <h3 className="mb-10">{t(translations.stats)}</h3>
          <BarChart data={chartData} />
          <FormControlLabel
            control={
              <Switch
                checked={state.includePhantomsInStats}
                color="primary"
                onChange={(_, value) =>
                  setState({ includePhantomsInStats: value })
                }
              />
            }
            label={<b>{t(translations.includePhantoms)}</b>}
          />
          <br />
          <RemindButton includePhantom={state.includePhantomsInStats} />
        </CardContent>
      </Card>
    );
  };

  const renderBody = (): JSX.Element => {
    if (isLoading) {
      return <LoadingIndicator />;
    }

    const { realResponses, phantomResponses } = responses.reduce(
      (categories, response) => {
        const cateogry = response.course_user.phantom
          ? 'phantomResponses'
          : 'realResponses';
        categories[cateogry].push(response);
        return categories;
      },
      { realResponses: [], phantomResponses: [] },
    );

    const {
      responses: realResponsesWithStatuses,
      summary: realResponsesStatuses,
    } = computeStatuses(realResponses);
    const {
      responses: phantomResponsesWithStatuses,
      summary: phantomResponsesStatuses,
    } = computeStatuses(phantomResponses);

    return (
      <div>
        {renderStats(realResponsesStatuses, phantomResponsesStatuses)}
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
