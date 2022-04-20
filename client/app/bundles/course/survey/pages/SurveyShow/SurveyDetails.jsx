import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { formatLongDateTime } from 'lib/moment';
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
import libTranslations from 'lib/translations';
import surveyTranslations from 'course/survey/translations';
import { surveyShape } from 'course/survey/propTypes';
import { updateSurvey } from 'course/survey/actions/surveys';
import RespondButton from 'course/survey/containers/RespondButton';
import NewSectionButton from './NewSectionButton';
import DownloadResponsesButton from './DownloadResponsesButton';

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
          style={{ whiteSpace: 'pre-line' }}
          dangerouslySetInnerHTML={{ __html: survey.description }}
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
                <FormattedMessage {...surveyTranslations.basePoints} />
              </TableCell>
              <TableCell>{survey.base_exp}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <FormattedMessage {...surveyTranslations.bonusPoints} />
              </TableCell>
              <TableCell>
                {survey.allow_response_after_end ? survey.time_bonus_exp : '-'}
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
          <Button
            variant="outlined"
            onClick={() =>
              navigate(`/courses/${courseId}/surveys/${survey.id}/results`)
            }
            style={styles.button}
          >
            <FormattedMessage {...surveyTranslations.results} />
          </Button>
        ) : null}
        {survey.canViewResults ? (
          <Button
            variant="outlined"
            onClick={() =>
              navigate(`/courses/${courseId}/surveys/${survey.id}/responses`)
            }
            style={styles.button}
          >
            <FormattedMessage {...surveyTranslations.responses} />
          </Button>
        ) : null}
        <DownloadResponsesButton />
        <RespondButton
          courseId={courseId}
          surveyId={survey.id}
          responseId={survey.response && survey.response.id}
          canRespond={survey.canRespond}
          canModify={!!survey.response && survey.response.canModify}
          canSubmit={!!survey.response && survey.response.canSubmit}
          startAt={survey.start_at}
          endAt={survey.end_at}
          submittedAt={survey.response && survey.response.submitted_at}
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
