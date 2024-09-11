import { Component } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { HourglassTop } from '@mui/icons-material';
import InsertDriveFile from '@mui/icons-material/InsertDriveFile';
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import withHeartbeatWorker from 'workers/withHeartbeatWorker';

import Banner from 'lib/components/core/layouts/Banner';
import Page from 'lib/components/core/layouts/Page';
import Link from 'lib/components/core/Link';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import withRouter from 'lib/components/navigation/withRouter';
import { getUrlParameter } from 'lib/helpers/url-helpers';

import assessmentsTranslations from '../../../translations';
import {
  enterStudentView,
  exitStudentView,
  fetchSubmission,
  purgeSubmissionStore,
} from '../../actions';
import ProgressPanel from '../../components/ProgressPanel';
import { workflowStates } from '../../constants';
import {
  assessmentShape,
  gradingShape,
  questionShape,
  submissionShape,
} from '../../propTypes';
import translations from '../../translations';

import RemainingTimeTranslations from './components/RemainingTimeTranslation';
import BlockedSubmission from './BlockedSubmission';
import SubmissionEmptyForm from './SubmissionEmptyForm';
import SubmissionForm from './SubmissionForm';
import TimeLimitBanner from './TimeLimitBanner';

class VisibleSubmissionEditIndex extends Component {
  constructor(props) {
    super(props);

    const stepString = getUrlParameter('step');
    const step =
      Number.isNaN(stepString) || stepString === ''
        ? null
        : parseInt(stepString, 10) - 1;

    this.state = { step };
  }

  componentDidMount() {
    const { dispatch, match, setSessionId } = this.props;
    dispatch(fetchSubmission(match.params.submissionId, setSessionId));
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch(purgeSubmissionStore());
  }

  renderTimeLimitBanner() {
    const { assessment, submission, submissionTimeLimitAt } = this.props;

    return (
      assessment.timeLimit &&
      !assessment.isKoditsuEnabled &&
      submission.workflowState === 'attempting' &&
      (submission.timerStartedAt ? (
        <TimeLimitBanner submissionTimeLimitAt={submissionTimeLimitAt} />
      ) : (
        <Banner
          className="bg-red-700 text-white border-only-b-fuchsia-200 fixed top-0 right-0"
          icon={<HourglassTop />}
        >
          <FormattedMessage
            {...translations.remainingTime}
            values={{
              timeLimit: (
                <RemainingTimeTranslations
                  remainingTime={assessment.timeLimit * 60 * 1000}
                />
              ),
            }}
          />
        </Banner>
      ))
    );
  }

  renderAssessment() {
    const { assessment, submission } = this.props;

    const renderFile = (file, index) => (
      <div key={index}>
        <InsertDriveFile style={{ verticalAlign: 'middle' }} />
        <Link href={file.url} opensInNewTab>
          {file.name}
        </Link>
      </div>
    );

    return (
      <Card style={{ marginBottom: 20 }}>
        <CardHeader title={assessment.title} />
        {assessment.description && (
          <CardContent>
            <Typography
              dangerouslySetInnerHTML={{ __html: assessment.description }}
              variant="body2"
            />
          </CardContent>
        )}
        {assessment.files?.length > 0 && (
          <CardContent>
            <Typography variant="h6">Files</Typography>
            {assessment.files.map(renderFile)}
          </CardContent>
        )}
        <CardActions>
          {submission.isGrader && this.renderStudentViewToggle()}
        </CardActions>
      </Card>
    );
  }

  renderContent() {
    const { step } = this.state;
    const { questions } = this.props;

    return Object.values(questions).length === 0 ? (
      <SubmissionEmptyForm />
    ) : (
      <SubmissionForm step={step} />
    );
  }

  renderProgress() {
    const { submission } = this.props;
    if (submission.graderView) {
      return <ProgressPanel submission={submission} />;
    }
    return null;
  }

  renderStudentViewToggle() {
    return (
      <FormControlLabel
        control={
          <Switch
            className="toggle-phantom"
            color="primary"
            onChange={(_, enabled) => {
              if (enabled) {
                this.props.dispatch(enterStudentView());
              } else {
                this.props.dispatch(exitStudentView());
              }
            }}
          />
        }
        label={
          <b>
            <FormattedMessage {...translations.studentView} />
          </b>
        }
        labelPlacement="end"
        style={{ marginLeft: '0.5px' }}
      />
    );
  }

  render() {
    const { isSubmissionBlocked, isLoading } = this.props;

    if (isLoading) return <LoadingIndicator />;
    if (isSubmissionBlocked) return <BlockedSubmission />;
    return (
      <Page className="space-y-5">
        {this.renderTimeLimitBanner()}
        {this.renderAssessment()}
        {this.renderProgress()}
        {this.renderContent()}
      </Page>
    );
  }
}

VisibleSubmissionEditIndex.propTypes = {
  dispatch: PropTypes.func.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      courseId: PropTypes.string,
      assessmentId: PropTypes.string,
      submissionId: PropTypes.string,
    }),
  }),
  assessment: assessmentShape,
  submissionTimeLimitAt: PropTypes.number,
  intl: PropTypes.object.isRequired,
  submission: submissionShape,
  isLoading: PropTypes.bool.isRequired,
  isSaving: PropTypes.bool.isRequired,
  isSubmissionBlocked: PropTypes.bool,
  setSessionId: PropTypes.func,
  questions: PropTypes.objectOf(questionShape),
  grading: gradingShape.isRequired,
  exp: PropTypes.number,
};

function mapStateToProps({ assessments: { submission } }) {
  const hasSubmissionTimeLimit =
    submission.submission.workflowState === workflowStates.Attempting &&
    submission.assessment.timeLimit &&
    submission.submission.timerStartedAt;
  const submissionTimeLimitAt = hasSubmissionTimeLimit
    ? new Date(submission.submission.timerStartedAt).getTime() +
      submission.assessment.timeLimit * 60 * 1000
    : null;

  return {
    assessment: submission.assessment,
    submissionTimeLimitAt,
    submission: submission.submission,
    isLoading: submission.submissionFlags.isLoading,
    isSaving: submission.submissionFlags.isSaving,
    isSubmissionBlocked: submission.submissionFlags.isSubmissionBlocked,
    questions: submission.questions,
    grading: submission.grading.questions,
    exp: submission.grading.exp,
  };
}

const handle = assessmentsTranslations.attempt;

const SubmissionEditIndex = withRouter(
  withHeartbeatWorker(
    connect(mapStateToProps)(injectIntl(VisibleSubmissionEditIndex)),
  ),
);

export default Object.assign(SubmissionEditIndex, { handle });
