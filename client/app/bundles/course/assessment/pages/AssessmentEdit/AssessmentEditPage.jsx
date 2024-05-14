import { Component } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { Button } from '@mui/material';
import PropTypes from 'prop-types';

import Page from 'lib/components/core/layouts/Page';
import { achievementTypesConditionAttributes } from 'lib/types';

import AssessmentForm from '../../components/AssessmentForm';
import { updateAssessment } from '../../operations/assessments';
import translations from '../../translations';

class AssessmentEditPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      redirectUrl: undefined,
    };
  }

  onFormSubmit = (data, setError) => {
    // Remove view_password and session_password field if password is disabled
    const viewPassword = data.password_protected ? data.view_password : null;
    const sessionPassword = data.password_protected
      ? data.session_password
      : null;
    const timeBonusExp = data.time_bonus_exp ? data.time_bonus_exp : 0;
    const timeLimit = data.has_time_limit ? data.time_limit : null;
    const atrributes = {
      ...data,
      time_bonus_exp: timeBonusExp,
      time_limit: timeLimit,
      view_password: viewPassword,
      session_password: sessionPassword,
    };

    const { dispatch, intl } = this.props;

    return dispatch(
      updateAssessment(
        data.id,
        { assessment: atrributes },
        intl.formatMessage(translations.updateSuccess),
        intl.formatMessage(translations.updateFailure),
        setError,
        (redirectUrl) => this.setState({ redirectUrl }),
      ),
    );
  };

  render() {
    const {
      intl,
      conditionAttributes,
      disabled,
      folderAttributes,
      gamified,
      initialValues,
      modeSwitching,
      canManageMonitor,
      pulsegridUrl,
      randomizationAllowed,
      showPersonalizedTimelineFeatures,
      monitoringEnabled,
    } = this.props;

    // TODO: Add a source router props that can be used to determine where
    // did the user come from, and initialise a Back button that goes there.
    return (
      <Page
        actions={
          <Button
            className="bg-white"
            disabled={disabled}
            form="assessment-form"
            type="submit"
            variant="outlined"
          >
            <FormattedMessage {...translations.updateAssessment} />
          </Button>
        }
        className="space-y-5"
        title={intl.formatMessage(translations.editAssessment)}
      >
        <AssessmentForm
          canManageMonitor={canManageMonitor}
          conditionAttributes={conditionAttributes}
          disabled={disabled}
          editing
          folderAttributes={folderAttributes}
          gamified={gamified}
          initialValues={initialValues}
          modeSwitching={modeSwitching}
          monitoringEnabled={monitoringEnabled}
          onSubmit={this.onFormSubmit}
          pulsegridUrl={pulsegridUrl}
          randomizationAllowed={randomizationAllowed}
          showPersonalizedTimelineFeatures={showPersonalizedTimelineFeatures}
        />

        {this.state.redirectUrl && <Navigate to={this.state.redirectUrl} />}
      </Page>
    );
  }
}

AssessmentEditPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  intl: PropTypes.object,
  // If the gamification feature is enabled in the course.
  gamified: PropTypes.bool,
  // If personalized timeline features are shown for the course
  showPersonalizedTimelineFeatures: PropTypes.bool,
  // If randomization is allowed for assessments in the current course
  randomizationAllowed: PropTypes.bool,
  // If allowed to switch between autograded and manually graded mode.
  modeSwitching: PropTypes.bool,
  // An array of materials of current assessment.
  folderAttributes: PropTypes.shape({}),
  conditionAttributes: achievementTypesConditionAttributes,
  // A set of assessment attributes: {:id , :title, etc}.
  initialValues: PropTypes.shape({}),
  // Whether to disable the inner form.
  disabled: PropTypes.bool,
  pulsegridUrl: PropTypes.string,
  canManageMonitor: PropTypes.bool,
  monitoringEnabled: PropTypes.bool,
};

export default connect(({ assessments }) => assessments.editPage)(
  injectIntl(AssessmentEditPage),
);
