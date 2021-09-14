import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { submit } from 'redux-form';
import { injectIntl, FormattedMessage, intlShape } from 'react-intl';
import RaisedButton from 'material-ui/RaisedButton';
import NotificationBar, {
  notificationShape,
} from 'lib/components/NotificationBar';
import { achievementTypesConditionAttributes } from 'lib/types';
import AssessmentForm from '../../containers/AssessmentForm';
import * as actions from '../../actions';
import translations from './translations.intl';
import { formNames } from '../../constants';

const styles = {
  buttonContainer: {
    marginTop: 16,
    marginLeft: 16,
  },
};

class EditPage extends Component {
  onFormSubmit = (data) => {
    // Remove view_password and session_password field if password is disabled
    const viewPassword = data.password_protected ? data.view_password : null;
    const sessionPassword = data.password_protected
      ? data.session_password
      : null;
    const atrributes = {
      ...data,
      view_password: viewPassword,
      session_password: sessionPassword,
    };

    const { intl } = this.props;

    return this.props.dispatch(
      actions.updateAssessment(
        data.id,
        { assessment: atrributes },
        intl.formatMessage(translations.updateSuccess),
        intl.formatMessage(translations.updateFailure),
      ),
    );
  };

  render() {
    const {
      gamified,
      showPersonalizedTimelineFeatures,
      modeSwitching,
      initialValues,
      randomizationAllowed,
      folderAttributes,
      conditionAttributes,
      dispatch,
    } = this.props;

    return (
      <>
        <AssessmentForm
          editing
          gamified={gamified}
          showPersonalizedTimelineFeatures={showPersonalizedTimelineFeatures}
          randomizationAllowed={randomizationAllowed}
          onSubmit={this.onFormSubmit}
          modeSwitching={modeSwitching}
          folderAttributes={folderAttributes}
          conditionAttributes={conditionAttributes}
          initialValues={initialValues}
        />
        <div style={styles.buttonContainer}>
          <RaisedButton
            label={<FormattedMessage {...translations.updateAssessment} />}
            primary
            disabled={this.props.disabled}
            onClick={() => dispatch(submit(formNames.ASSESSMENT))}
          />
        </div>
        <NotificationBar notification={this.props.notification} />
      </>
    );
  }
}

EditPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  intl: intlShape,
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

export default connect((state) => state.editPage)(injectIntl(EditPage));
