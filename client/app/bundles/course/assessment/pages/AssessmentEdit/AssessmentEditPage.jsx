import { Component } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { Button } from '@mui/material';
import PropTypes from 'prop-types';

import NotificationBar, {
  notificationShape,
} from 'lib/components/core/NotificationBar';
import PageHeader from 'lib/components/navigation/PageHeader';
import { achievementTypesConditionAttributes } from 'lib/types';

import * as actions from '../../actions';
import AssessmentForm from '../../components/AssessmentForm';
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
    const atrributes = {
      ...data,
      time_bonus_exp: timeBonusExp,
      view_password: viewPassword,
      session_password: sessionPassword,
    };

    const { dispatch, intl } = this.props;

    return dispatch(
      actions.updateAssessment(
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
      notification,
      randomizationAllowed,
      showPersonalizedTimelineFeatures,
    } = this.props;

    // TODO: Add a source router props that can be used to determine where
    // did the user come from, and initialise a Back button that goes there.
    return (
      <main className="space-y-5">
        <PageHeader title={intl.formatMessage(translations.editAssessment)}>
          <Button
            className="bg-white"
            disabled={disabled}
            form="assessment-form"
            type="submit"
            variant="outlined"
          >
            <FormattedMessage {...translations.updateAssessment} />
          </Button>
        </PageHeader>

        <AssessmentForm
          conditionAttributes={conditionAttributes}
          disabled={disabled}
          editing
          folderAttributes={folderAttributes}
          gamified={gamified}
          initialValues={initialValues}
          modeSwitching={modeSwitching}
          onSubmit={this.onFormSubmit}
          randomizationAllowed={randomizationAllowed}
          showPersonalizedTimelineFeatures={showPersonalizedTimelineFeatures}
        />

        <NotificationBar notification={notification} />

        {this.state.redirectUrl && <Navigate to={this.state.redirectUrl} />}
      </main>
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
  notification: notificationShape,
};

export default connect((state) => state.editPage)(
  injectIntl(AssessmentEditPage),
);
