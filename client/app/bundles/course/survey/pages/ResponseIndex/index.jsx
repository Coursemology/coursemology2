import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Tooltip } from 'react-tooltip';
import {
  Card,
  CardContent,
  Chip,
  FormControlLabel,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { red } from '@mui/material/colors';
import { useTheme } from '@mui/material/styles';
import mirrorCreator from 'mirror-creator';
import PropTypes from 'prop-types';

import { fetchResponses } from 'course/survey/actions/responses';
import { responseShape, surveyShape } from 'course/survey/propTypes';
import surveyTranslations from 'course/survey/translations';
import BarChart from 'lib/components/core/BarChart';
import Link from 'lib/components/core/Link';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import moment, { formatLongDateTime } from 'lib/moment';

import { workflowStates } from '../../constants';
import withSurveyLayout from '../../containers/SurveyLayout';
import UnsubmitButton from '../../containers/UnsubmitButton';

import RemindButton from './RemindButton';
import translations from './translations';

const styles = {
  red: {
    color: red[500],
  },
  table: {
    maxWidth: 600,
  },
  chip: {
    width: 100,
  },
  detailsCard: {
    marginBottom: 30,
  },
  statsCard: {
    marginBottom: 30,
  },
  statsHeader: {
    marginBottom: 30,
  },
};

const responseStatus = mirrorCreator([
  'NOT_STARTED',
  'SUBMITTED',
  'RESPONDING',
]);

const ResponseIndex = (props) => {
  const { dispatch, survey, responses, isLoading } = props;
  const { palette } = useTheme();
  const { NOT_STARTED, RESPONDING, SUBMITTED } = responseStatus;
  const dataColor = {
    [NOT_STARTED]:
      palette.submissionStatus &&
      palette.submissionStatus[workflowStates.Unstarted],
    [RESPONDING]:
      palette.submissionStatus &&
      palette.submissionStatus[workflowStates.Attempting],
    [SUBMITTED]:
      palette.submissionStatus &&
      palette.submissionStatus[workflowStates.Submitted],
  };
  const [state, setState] = useState({
    includePhantomsInStats: false,
  });

  useEffect(() => {
    dispatch(fetchResponses());
  }, [dispatch]);

  const computeStatuses = (computeResponses) => {
    const summary = {
      [responseStatus.NOT_STARTED]: 0,
      [responseStatus.SUBMITTED]: 0,
      [responseStatus.RESPONDING]: 0,
    };
    const responsesWithStatuses = [];
    const updateStatus = (response, status) => {
      summary[status] += 1;
      responsesWithStatuses.push({ ...response, status });
    };
    computeResponses.forEach((response) => {
      if (!response.present) {
        updateStatus(response, responseStatus.NOT_STARTED);
      } else if (response.submitted_at) {
        updateStatus(response, responseStatus.SUBMITTED);
      } else {
        updateStatus(response, responseStatus.RESPONDING);
      }
    });

    return { responses: responsesWithStatuses, summary };
  };

  const renderUpdatedAt = (response) => {
    if (!response.submitted_at) {
      return null;
    }
    const updatedAt = formatLongDateTime(response.updated_at);
    if (survey.end_at && moment(response.updated_at).isAfter(survey.end_at)) {
      return <div style={styles.red}>{updatedAt}</div>;
    }
    return updatedAt;
  };

  const renderResponseStatus = (response) => {
    const status = <FormattedMessage {...translations[response.status]} />;

    return (
      <Chip
        clickable={
          response.status !== responseStatus.NOT_STARTED && !survey.anonymous
        }
        label={
          response.status !== responseStatus.NOT_STARTED &&
          !survey.anonymous ? (
            <Link to={response.path}>{status}</Link>
          ) : (
            status
          )
        }
        style={{
          ...styles.chip,
          backgroundColor: survey.anonymous
            ? palette.submissionStatus.Submitted // grey colour
            : dataColor[response.status],
          color:
            response.status !== responseStatus.NOT_STARTED && palette.links,
        }}
        variant="filled"
      />
    );
  };

  const renderSubmittedAt = (response) => {
    if (!response.submitted_at) {
      return null;
    }
    const submittedAt = formatLongDateTime(response.submitted_at);
    if (survey.end_at && moment(response.submitted_at).isAfter(survey.end_at)) {
      return <div style={styles.red}>{submittedAt}</div>;
    }
    return submittedAt;
  };

  const renderTable = (tableResponses) => (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell colSpan={2}>
            <FormattedMessage {...translations.name} />
          </TableCell>
          <TableCell>
            <FormattedMessage {...translations.responseStatus} />
          </TableCell>
          <TableCell>
            <FormattedMessage {...translations.submittedAt} />
          </TableCell>
          <TableCell>
            <FormattedMessage {...translations.updatedAt} />
          </TableCell>
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
              {response.status === responseStatus.SUBMITTED &&
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

  const renderPhantomTable = (tableResponses) => {
    if (tableResponses.length < 1) {
      return null;
    }

    return (
      <div>
        <h1>
          <FormattedMessage {...translations.phantoms} />
        </h1>
        {renderTable(tableResponses)}
      </div>
    );
  };

  const renderStats = (realResponsesStatuses, phantomResponsesStatuses) => {
    const chartData = [NOT_STARTED, RESPONDING, SUBMITTED].map((data) => {
      const count = state.includePhantomsInStats
        ? realResponsesStatuses[data] + phantomResponsesStatuses[data]
        : realResponsesStatuses[data];
      return {
        count,
        color: dataColor[data],
        label: <FormattedMessage {...translations[data]} />,
      };
    });

    return (
      <Card style={styles.statsCard}>
        <CardContent>
          <h3 style={styles.statsHeader}>
            <FormattedMessage {...translations.stats} />
          </h3>
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
            label={
              <b>
                <FormattedMessage {...translations.includePhantoms} />
              </b>
            }
          />
          <br />
          <RemindButton includePhantom={state.includePhantomsInStats} />
        </CardContent>
      </Card>
    );
  };

  const renderBody = () => {
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

        <Tooltip id="unsubmit-button">
          <FormattedMessage {...translations.unsubmit} />
        </Tooltip>
      </div>
    );
  };

  const renderHeader = () => (
    <Card style={styles.detailsCard}>
      <Table style={styles.table}>
        <TableBody>
          <TableRow>
            <TableCell>
              <FormattedMessage {...surveyTranslations.startsAt} />
            </TableCell>
            <TableCell>{formatLongDateTime(survey.start_at)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <FormattedMessage {...surveyTranslations.endsAt} />
            </TableCell>
            <TableCell>{formatLongDateTime(survey.end_at)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <FormattedMessage {...surveyTranslations.closingRemindedAt} />
            </TableCell>
            <TableCell>
              {formatLongDateTime(survey.closing_reminded_at, '-')}
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

ResponseIndex.propTypes = {
  survey: surveyShape,
  dispatch: PropTypes.func.isRequired,
  responses: PropTypes.arrayOf(responseShape),
  isLoading: PropTypes.bool.isRequired,
};

const handle = translations.responses;

export default Object.assign(
  withSurveyLayout(connect(({ surveys }) => surveys.responses)(ResponseIndex)),
  { handle },
);
