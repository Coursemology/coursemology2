import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import {
  Button,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Switch,
} from '@material-ui/core';

import history from 'lib/history';
import { formatShortDateTime } from 'lib/moment';
import translations from 'course/survey/translations';
import { surveyShape } from 'course/survey/propTypes';
import { updateSurvey } from 'course/survey/actions/surveys';
import RespondButton from 'course/survey/containers/RespondButton';

const styles = {
  tableBody: {
    // Prevent new survey button from obstructing table.
    marginBottom: 100,
  },
  buttonsColumn: {
    display: 'flex',
  },
  button: {
    marginRight: 15,
  },
  wrap: {
    whiteSpace: 'normal',
    wordWrap: 'break-word',
  },
};

class SurveysTable extends React.Component {
  renderPublishToggle(survey) {
    const { dispatch } = this.props;
    if (!survey.canUpdate) {
      return null;
    }

    return (
      <FormControlLabel
        control={
          <Switch
            checked={survey.published}
            color="primary"
            onChange={(event, value) =>
              dispatch(
                updateSurvey(
                  survey.id,
                  { survey: { published: value } },
                  <FormattedMessage
                    {...translations.updateSuccess}
                    values={survey}
                  />,
                  <FormattedMessage
                    {...translations.updateFailure}
                    values={survey}
                  />,
                ),
              )
            }
          />
        }
        labelPlacement="end"
      />
    );
  }

  render() {
    const {
      surveys,
      courseId,
      surveysFlags: { canCreate },
    } = this.props;
    return (
      <Table bodyStyle={styles.tableBody}>
        <TableHead>
          <TableRow>
            <TableCell colSpan={6}>
              <FormattedMessage {...translations.title} />
            </TableCell>
            <TableCell colSpan={3} style={styles.wrap}>
              <FormattedMessage {...translations.basePoints} />
            </TableCell>
            <TableCell colSpan={3} style={styles.wrap}>
              <FormattedMessage {...translations.bonusPoints} />
            </TableCell>
            <TableCell colSpan={5}>
              <FormattedMessage {...translations.opensAt} />
            </TableCell>
            <TableCell colSpan={5}>
              <FormattedMessage {...translations.expiresAt} />
            </TableCell>
            {canCreate ? (
              <TableCell colSpan={2}>
                <FormattedMessage {...translations.published} />
              </TableCell>
            ) : null}
            <TableCell colSpan={canCreate ? 14 : 4} />
          </TableRow>
        </TableHead>
        <TableBody>
          {surveys.map((survey) => (
            <TableRow key={survey.id}>
              <TableCell colSpan={6} style={styles.wrap}>
                <Link to={`/courses/${courseId}/surveys/${survey.id}`}>
                  {survey.title}
                </Link>
              </TableCell>
              <TableCell colSpan={3}>{survey.base_exp}</TableCell>
              <TableCell colSpan={3}>
                {survey.allow_response_after_end ? survey.time_bonus_exp : '-'}
              </TableCell>
              <TableCell colSpan={5} style={styles.wrap}>
                {formatShortDateTime(survey.start_at)}
              </TableCell>
              <TableCell colSpan={5} style={styles.wrap}>
                {formatShortDateTime(survey.end_at)}
              </TableCell>
              {canCreate ? (
                <TableCell colSpan={2}>
                  {this.renderPublishToggle(survey)}
                </TableCell>
              ) : null}
              <TableCell colSpan={canCreate ? 14 : 4}>
                <div style={styles.buttonsColumn}>
                  {survey.canViewResults ? (
                    <Button
                      variant="contained"
                      onClick={() =>
                        history.push(
                          `/courses/${courseId}/surveys/${survey.id}/results`,
                        )
                      }
                      style={styles.button}
                    >
                      <FormattedMessage {...translations.results} />
                    </Button>
                  ) : null}
                  {survey.canViewResults ? (
                    <Button
                      variant="contained"
                      onClick={() =>
                        history.push(
                          `/courses/${courseId}/surveys/${survey.id}/responses`,
                        )
                      }
                      style={styles.button}
                    >
                      <FormattedMessage {...translations.responses} />
                    </Button>
                  ) : null}
                  <RespondButton
                    courseId={courseId}
                    surveyId={survey.id}
                    responseId={survey.response && survey.response.id}
                    canRespond={survey.canRespond}
                    canModify={!!survey.response && survey.response.canModify}
                    canSubmit={!!survey.response && survey.response.canSubmit}
                    startAt={survey.start_at}
                    endAt={survey.end_at}
                    submittedAt={
                      survey.response && survey.response.submitted_at
                    }
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }
}

SurveysTable.propTypes = {
  courseId: PropTypes.string.isRequired,

  surveys: PropTypes.arrayOf(surveyShape),
  surveysFlags: PropTypes.shape({
    canCreate: PropTypes.bool.isRequired,
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect((state) => state)(SurveysTable);
