import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage } from 'react-intl';
import { Button } from '@mui/material';
import NotificationBar, {
  notificationShape,
} from 'lib/components/core/NotificationBar';
import { achievementTypesConditionAttributes } from 'lib/types';
import AssessmentForm from '../../components/AssessmentForm';
import * as actions from '../../actions';
import translations from './translations.intl';

class EditPage extends Component {
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
      ),
    );
  };

  render() {
    const {
      conditionAttributes,
      containsCodaveri,
      disabled,
      folderAttributes,
      gamified,
      initialValues,
      modeSwitching,
      notification,
      randomizationAllowed,
      showPersonalizedTimelineFeatures,
    } = this.props;

    return (
      <>
        <div className="absolute right-8 -mt-24">
          <Button
            variant="contained"
            color="primary"
            className="btn-submit"
            disabled={disabled}
            form="assessment-form"
            type="submit"
          >
            <FormattedMessage {...translations.updateAssessment} />
          </Button>
        </div>

        <AssessmentForm
          conditionAttributes={conditionAttributes}
          disabled={disabled}
          editing
          folderAttributes={folderAttributes}
          gamified={gamified}
          initialValues={initialValues}
          modeSwitching={modeSwitching}
          containsCodaveri={containsCodaveri}
          onSubmit={this.onFormSubmit}
          randomizationAllowed={randomizationAllowed}
          showPersonalizedTimelineFeatures={showPersonalizedTimelineFeatures}
        />

        <NotificationBar notification={notification} />
      </>
    );
  }
}

EditPage.propTypes = {
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
  // If an assessment contains question of programming codaveri type
  containsCodaveri: PropTypes.bool,
  // An array of materials of current assessment.
  folderAttributes: PropTypes.shape({}),
  conditionAttributes: achievementTypesConditionAttributes,
  // A set of assessment attributes: {:id , :title, etc}.
  initialValues: PropTypes.shape({}),
  // Whether to disable the inner form.
  disabled: PropTypes.bool,
  notification: notificationShape,
};

export default connect((state) => state.editPage)(injectIntl(EditPage));
