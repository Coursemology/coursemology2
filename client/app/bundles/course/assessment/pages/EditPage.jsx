import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { submit } from 'redux-form';
import { injectIntl, FormattedMessage, intlShape } from 'react-intl';
import RaisedButton from 'material-ui/RaisedButton';
import NotificationBar, { notificationShape } from 'lib/components/NotificationBar';
import AssessmentForm from '../containers/AssessmentForm';
import * as actions from '../actions';
import translations from './EditPage.intl';
import { formNames } from '../constants';

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
    // An array of materials of current assessment.
    folderAttributes: PropTypes.shape({}),
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
    const { initialValues, folderAttributes, dispatch } = this.props;

    return (
      <div>
        <AssessmentForm
          editing
          onSubmit={this.onFormSubmit}
          folderAttributes={folderAttributes}
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
