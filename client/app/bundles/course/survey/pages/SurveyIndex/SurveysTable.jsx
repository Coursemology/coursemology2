import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Switch,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import PropTypes from 'prop-types';

import { updateSurvey } from 'course/survey/actions/surveys';
import RespondButton from 'course/survey/containers/RespondButton';
import { surveyShape } from 'course/survey/propTypes';
import translations from 'course/survey/translations';
import TableContainer from 'lib/components/core/layouts/TableContainer';
import Link from 'lib/components/core/Link';
import { formatShortDateTime } from 'lib/moment';

import SurveyBadges from './SurveyBadges';

const styles = {
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

const SurveysTable = (props) => {
  const {
    surveys,
    courseId,
    surveysFlags: { canCreate },
  } = props;

  const navigate = useNavigate();

  const renderPublishToggle = (survey) => {
    const { dispatch } = props;
    if (!survey.canUpdate) {
      return null;
    }

    return (
      <Switch
        checked={survey.published}
        color="primary"
        onChange={(_, value) =>
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
    );
  };

  return (
    <TableContainer dense variant="bare">
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
            <FormattedMessage {...translations.startsAt} />
          </TableCell>
          <TableCell colSpan={5}>
            <FormattedMessage {...translations.endsAt} />
          </TableCell>
          <TableCell colSpan={5}>
            <FormattedMessage {...translations.bonusEndsAt} />
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
              <div className="flex flex-col items-start justify-between xl:flex-row xl:items-center">
                <label className="m-0 font-normal" title={survey.title}>
                  <Link
                    className="line-clamp-2 xl:line-clamp-1"
                    to={`/courses/${courseId}/surveys/${survey.id}`}
                    underline="hover"
                  >
                    {survey.title}
                  </Link>
                </label>
                <SurveyBadges survey={survey} />
              </div>
            </TableCell>
            <TableCell colSpan={3}>{survey.base_exp}</TableCell>
            <TableCell colSpan={3}>{survey.time_bonus_exp}</TableCell>
            <TableCell colSpan={5} style={styles.wrap}>
              {formatShortDateTime(survey.start_at)}
            </TableCell>
            <TableCell colSpan={5} style={styles.wrap}>
              {formatShortDateTime(survey.end_at)}
            </TableCell>
            <TableCell colSpan={5} style={styles.wrap}>
              {survey.bonus_end_at
                ? formatShortDateTime(survey.bonus_end_at)
                : '-'}
            </TableCell>
            {canCreate ? (
              <TableCell colSpan={2}>{renderPublishToggle(survey)}</TableCell>
            ) : null}
            <TableCell colSpan={canCreate ? 14 : 4}>
              <div style={styles.buttonsColumn}>
                {survey.canManage && (
                  <Button
                    onClick={() =>
                      navigate(
                        `/courses/${courseId}/surveys/${survey.id}/results`,
                      )
                    }
                    style={styles.button}
                    variant="outlined"
                  >
                    <FormattedMessage {...translations.results} />
                  </Button>
                )}
                {survey.canManage && (
                  <Button
                    onClick={() =>
                      navigate(
                        `/courses/${courseId}/surveys/${survey.id}/responses`,
                      )
                    }
                    style={styles.button}
                    variant="outlined"
                  >
                    <FormattedMessage {...translations.responses} />
                  </Button>
                )}
                <RespondButton
                  canModify={!!survey.response && survey.response.canModify}
                  canRespond={survey.canRespond}
                  canSubmit={!!survey.response && survey.response.canSubmit}
                  courseId={courseId}
                  endAt={survey.end_at}
                  responseId={survey.response && survey.response.id}
                  startAt={survey.start_at}
                  submittedAt={survey.response && survey.response.submitted_at}
                  surveyId={survey.id}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </TableContainer>
  );
};

SurveysTable.propTypes = {
  courseId: PropTypes.string.isRequired,

  surveys: PropTypes.arrayOf(surveyShape),
  surveysFlags: PropTypes.shape({
    canCreate: PropTypes.bool.isRequired,
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect(({ surveys }) => surveys)(SurveysTable);
