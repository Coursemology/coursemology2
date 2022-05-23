import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment, { formatLongDateTime } from 'lib/moment';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import mirrorCreator from 'mirror-creator';
import {
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { red } from '@mui/material/colors';
import BarChart from 'lib/components/BarChart';
import { fetchResponses } from 'course/survey/actions/responses';
import surveyTranslations from 'course/survey/translations';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import UnsubmitButton from 'course/survey/containers/UnsubmitButton';
import { surveyShape, responseShape } from 'course/survey/propTypes';
import { useTheme } from '@emotion/react';
import RemindButton from './RemindButton';
import { workflowStates } from '../../../assessment/submission/constants';

const styles = {
  red: {
    color: red[500],
  },
  table: {
    maxWidth: 600,
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

const translations = defineMessages({
  name: {
    id: 'course.surveys.ResponseIndex.name',
    defaultMessage: 'Name',
  },
  responseStatus: {
    id: 'course.surveys.ResponseIndex.responseStatus',
    defaultMessage: 'Response Status',
  },
  [responseStatus.NOT_STARTED]: {
    id: 'course.surveys.ResponseIndex.notStarted',
    defaultMessage: 'Not Started',
  },
  [responseStatus.SUBMITTED]: {
    id: 'course.surveys.ResponseIndex.submitted',
    defaultMessage: 'Submitted',
  },
  [responseStatus.RESPONDING]: {
    id: 'course.surveys.ResponseIndex.responding',
    defaultMessage: 'Responding',
  },
  submittedAt: {
    id: 'course.surveys.ResponseIndex.submittedAt',
    defaultMessage: 'Submitted At',
  },
  updatedAt: {
    id: 'course.surveys.ResponseIndex.updatedAt',
    defaultMessage: 'Last Updated At',
  },
  phantoms: {
    id: 'course.surveys.ResponseIndex.phantoms',
    defaultMessage: 'Phantom Students',
  },
  stats: {
    id: 'course.surveys.ResponseIndex.stats',
    defaultMessage: 'Response Statistics',
  },
  includePhantoms: {
    id: 'course.surveys.ResponseIndex.includePhantoms',
    defaultMessage: 'Include Phantom Students',
  },
});

const ResponseIndex = (props) => {
  const { palette } = useTheme();
  const [state, setState] = useState({
    includePhantomsInStats: false,
  });

  useEffect(() => {
    const { dispatch } = props;
    dispatch(fetchResponses());
  }, []);

  const computeStatuses = (responses) => {
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
    responses.forEach((response) => {
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

  const renderUpdatedAt = (response, survey) => {
    if (!response.submitted_at) {
      return null;
    }
    const updatedAt = formatLongDateTime(response.updated_at);
    if (survey.end_at && moment(response.updated_at).isAfter(survey.end_at)) {
      return <div style={styles.red}>{updatedAt}</div>;
    }
    return updatedAt;
  };

  const renderResponseStatus = (response, survey) => {
    const status = <FormattedMessage {...translations[response.status]} />;
    if (response.status === responseStatus.NOT_STARTED) {
      return <div style={styles.red}>{status}</div>;
    }
    return survey.anonymous ? status : <Link to={response.path}>{status}</Link>;
  };

  const renderSubmittedAt = (response, survey) => {
    if (!response.submitted_at) {
      return null;
    }
    const submittedAt = formatLongDateTime(response.submitted_at);
    if (survey.end_at && moment(response.submitted_at).isAfter(survey.end_at)) {
      return <div style={styles.red}>{submittedAt}</div>;
    }
    return submittedAt;
  };

  const renderTable = (responses, survey) => (
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
        {responses.map((response) => (
          <TableRow key={response.course_user.id}>
            <TableCell colSpan={2}>
              <a href={response.course_user.path}>
                {response.course_user.name}
              </a>
            </TableCell>
            <TableCell>{renderResponseStatus(response, survey)}</TableCell>
            <TableCell>{renderSubmittedAt(response, survey)}</TableCell>
            <TableCell>{renderUpdatedAt(response, survey)}</TableCell>
            <TableCell>
              {response.status === responseStatus.SUBMITTED &&
              response.canUnsubmit ? (
                <UnsubmitButton responseId={response.id} />
              ) : null}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderPhantomTable = (responses, survey) => {
    if (responses.length < 1) {
      return null;
    }

    return (
      <div>
        <h1>
          <FormattedMessage {...translations.phantoms} />
        </h1>
        {renderTable(responses, survey)}
      </div>
    );
  };

  const renderStats = (realResponsesStatuses, phantomResponsesStatuses) => {
    const { NOT_STARTED, RESPONDING, SUBMITTED } = responseStatus;
    console.log(palette);
    const dataColor = {
      [NOT_STARTED]: palette && palette.status[workflowStates.Unstarted],
      [RESPONDING]: palette && palette.status[workflowStates.Attempting],
      [SUBMITTED]: palette && palette.status[workflowStates.Published],
    };
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
    const { survey, responses, isLoading } = props;
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
        {renderTable(realResponsesWithStatuses, survey)}
        {renderPhantomTable(phantomResponsesWithStatuses, survey)}
      </div>
    );
  };

  const renderHeader = () => {
    const { survey } = props;
    return (
      <Card style={styles.detailsCard}>
        <Table style={styles.table}>
          <TableBody>
            <TableRow>
              <TableCell>
                <FormattedMessage {...surveyTranslations.opensAt} />
              </TableCell>
              <TableCell>{formatLongDateTime(survey.start_at)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <FormattedMessage {...surveyTranslations.expiresAt} />
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
  };

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

export default connect((rootState) => rootState.responses)(ResponseIndex);
