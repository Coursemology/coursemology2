import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { submit } from 'redux-form';
import { injectIntl, FormattedMessage, intlShape } from 'react-intl';
import RaisedButton from 'material-ui/RaisedButton';
import NotificationBar, { notificationShape } from 'lib/components/NotificationBar';
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

class EditPage extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    intl: intlShape,
    // If the gamification feature is enabled in the course.
    gamified: PropTypes.bool,
    // If allow to switch between autoraded and manually graded mode.
    modeSwitching: PropTypes.bool,
    // An array of materials of current assessment.
    folderAttributes: PropTypes.shape({}),
    conditionAttributes: PropTypes.shape({
      new_condition_urls: PropTypes.array,
      conditions: PropTypes.array,
    }),
    // A set of assessment attributes: {:id , :title, etc}.
    initialValues: PropTypes.shape({}),
    // Whether to disable the inner form.
    disabled: PropTypes.bool,
    notification: notificationShape,
  };

  onFormSubmit = (data) => {
    // Remove password field if password is disabled
    const password = data.password_protected ? data.password : null;
    const atrributes = Object.assign({}, data, { password });

    const { intl } = this.props;

    return this.props.dispatch(
      actions.updateAssessment(
        data.id,
        { assessment: atrributes },
        intl.formatMessage(translations.updateSuccess),
        intl.formatMessage(translations.updateFailure)
      )
    );
  };

  render() {
    const { gamified, modeSwitching, initialValues, folderAttributes,
      conditionAttributes, dispatch } = this.props;

    return (
      <div>
        <AssessmentForm
          editing
          gamified={gamified}
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
            onTouchTap={() => dispatch(submit(formNames.ASSESSMENT))}
          />
        </div>
        <NotificationBar notification={this.props.notification} />
      </div>
    );
  }
}

export default connect(state =>
   (state.editPage)
)(injectIntl(EditPage));
