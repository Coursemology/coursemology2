import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment, { formatLongDateTime } from 'lib/moment';
import { FormattedMessage } from 'react-intl';
import mirrorCreator from 'mirror-creator';
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
  Link,
} from '@mui/material';
import { red } from '@mui/material/colors';
import BarChart from 'lib/components/BarChart';
import {
  fetchResponses,
  unsubmitResponse,
} from 'course/survey/actions/responses';
import surveyTranslations from 'course/survey/translations';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import UnsubmitButton from 'course/survey/containers/UnsubmitButton';
import { surveyShape, responseShape } from 'course/survey/propTypes';
import { useTheme } from '@mui/material/styles';
import RemindButton from './RemindButton';
import { workflowStates } from '../../constants';

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
      palette.submissionStatus[workflowStates.Published],
  };
  const [state, setState] = useState({
    includePhantomsInStats: false,
    unsubmitConfirmation: false,
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

  const renderResponseStatus = (response) => (
    <FormattedMessage {...translations[response.status]}>
      {(msg) => (
        <Chip
          clickable={response.status !== responseStatus.NOT_STARTED 
            && !survey.anonymous}
          label={msg}
          component={response.status !== responseStatus.NOT_STARTED 
            && !survey.anonymous ? Link : null}
          href={response.path}
          style={{
            ...styles.chip,
            backgroundColor: survey.anonymous
              ? palette.submissionStatus.Submitted // grey colour
              : dataColor[response.status],
            color: response.status !== responseStatus.NOT_STARTED
              && palette.links
          }}
          variant="filled"
        />
      )}
    </FormattedMessage>
  );

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

  const handleUnsubmitResponse = (buttonId) => {
    const { unsubmitSuccess, unsubmitFailure } = translations;
    const successMessage = <FormattedMessage {...unsubmitSuccess} />;
    const failureMessage = <FormattedMessage {...unsubmitFailure} />;

    setState({ open: false });
    return dispatch(unsubmitResponse(buttonId, successMessage, failureMessage));
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
              <a href={response.course_user.path}>
                {response.course_user.name}
              </a>
            </TableCell>
            <TableCell>{renderResponseStatus(response)}</TableCell>
            <TableCell>{renderSubmittedAt(response)}</TableCell>
            <TableCell>{renderUpdatedAt(response)}</TableCell>
            <TableCell>
              {response.status === responseStatus.SUBMITTED &&
              response.canUnsubmit ? (
                <>
                  <UnsubmitButton
                    buttonId={response.id}
                    color={palette.submissionIcon.unsubmit}
                    setState={setState}
                    state={state}
                  />
                  <ReactTooltip id="unsubmit-button" effect="solid">
                    <FormattedMessage {...translations.unsubmit} />
                  </ReactTooltip>
                  <ConfirmationDialog
                    message={<FormattedMessage {...translations.confirm} />}
                    open={state.unsubmitConfirmation}
                    onCancel={() =>
                      setState({ ...state, unsubmitConfirmation: false })
                    }
                    onConfirm={() => handleUnsubmitResponse(response.id)}
                  />
                </>
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
      </div>
    );
  };

  const renderHeader = () => (
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
