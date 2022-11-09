import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@mui/material';
import PropTypes from 'prop-types';

import { updateSurvey } from 'course/survey/actions/surveys';
import RespondButton from 'course/survey/containers/RespondButton';
import { surveyShape } from 'course/survey/propTypes';
import surveyTranslations from 'course/survey/translations';
import { formatLongDateTime } from 'lib/moment';
import libTranslations from 'lib/translations';

import DownloadResponsesButton from './DownloadResponsesButton';
import NewSectionButton from './NewSectionButton';

const styles = {
  table: {
    maxWidth: 600,
  },
  button: {
    marginRight: 15,
  },
  toggleContainer: {
    paddingTop: 0,
    paddingBottom: 0,
  },
};

const SurveyDetails = (props) => {
  const { survey, courseId, disabled } = props;
  const navigate = useNavigate();

  const handlePublishToggle = (event, value) => {
    const { dispatch } = props;
    dispatch(
      updateSurvey(
        survey.id,
        { survey: { published: value } },
        <FormattedMessage
          {...surveyTranslations.updateSuccess}
          values={survey}
        />,
        <FormattedMessage
          {...surveyTranslations.updateFailure}
          values={survey}
        />,
      ),
    );
  };

  const renderDescription = () => {
    if (!survey.description) {
      return null;
    }

    return (
      <CardContent>
        <h4>
          <FormattedMessage {...surveyTranslations.description} />
        </h4>
        <p
          dangerouslySetInnerHTML={{ __html: survey.description }}
          style={{ whiteSpace: 'pre-line' }}
        />
      </CardContent>
    );
  };

  const renderPublishToggle = () => {
    if (!survey.canUpdate) {
      return null;
    }

    return (
      <CardContent style={styles.toggleContainer}>
        <FormControlLabel
          control={
            <Switch
              checked={survey.published}
              color="primary"
              onChange={handlePublishToggle}
            />
          }
          label={<FormattedMessage {...surveyTranslations.published} />}
          labelPlacement="end"
        />
      </CardContent>
    );
  };

  if (!survey) {
    return null;
  }
  return (
    <Card>
      <div>
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
                <FormattedMessage {...surveyTranslations.bonusEndsAt} />
              </TableCell>
              <TableCell>
                {survey.bonus_end_at
                  ? formatLongDateTime(survey.bonus_end_at)
                  : '-'}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <FormattedMessage {...surveyTranslations.basePoints} />
              </TableCell>
              <TableCell>{survey.base_exp}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <FormattedMessage {...surveyTranslations.bonusPoints} />
              </TableCell>
              <TableCell>{survey.time_bonus_exp}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <FormattedMessage
                  {...surveyTranslations.allowResponseAfterEnd}
                />
              </TableCell>
              <TableCell>
                <FormattedMessage
                  {...libTranslations[
                    survey.allow_response_after_end ? 'yes' : 'no'
                  ]}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <FormattedMessage
                  {...surveyTranslations.allowModifyAfterSubmit}
                />
              </TableCell>
              <TableCell>
                <FormattedMessage
                  {...libTranslations[
                    survey.allow_modify_after_submit ? 'yes' : 'no'
                  ]}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <FormattedMessage {...surveyTranslations.anonymous} />
              </TableCell>
              <TableCell>
                <FormattedMessage
                  {...libTranslations[survey.anonymous ? 'yes' : 'no']}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      {renderPublishToggle()}
      {renderDescription()}
      <CardContent>
        {survey.canCreateSection ? (
          <NewSectionButton {...{ disabled }} />
        ) : null}
        {survey.canViewResults ? (
          <>
            <Button
              onClick={() =>
                navigate(`/courses/${courseId}/surveys/${survey.id}/results`)
              }
              style={styles.button}
              variant="outlined"
            >
              <FormattedMessage {...surveyTranslations.results} />
            </Button>
            <Button
              onClick={() =>
                navigate(`/courses/${courseId}/surveys/${survey.id}/responses`)
              }
              style={styles.button}
              variant="outlined"
            >
              <FormattedMessage {...surveyTranslations.responses} />
            </Button>
            <DownloadResponsesButton />
          </>
        ) : null}

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
      </CardContent>
    </Card>
  );
};

SurveyDetails.propTypes = {
  survey: surveyShape,
  courseId: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,

  dispatch: PropTypes.func.isRequired,
};

export default connect()(SurveyDetails);
