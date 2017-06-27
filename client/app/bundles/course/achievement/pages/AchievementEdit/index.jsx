import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { submit } from 'redux-form';
import { injectIntl, FormattedMessage, intlShape } from 'react-intl';
import RaisedButton from 'material-ui/RaisedButton';
import NotificationBar, { notificationShape } from 'lib/components/NotificationBar';
import AchievementForm from '../../containers/AchievementForm';
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
    disabled: PropTypes.bool,
    conditionAttributes: PropTypes.shape({
      new_condition_urls: PropTypes.array,
      conditions: PropTypes.array,
    }),
    // A set of achievement attributes: {:id , :title, etc}.
    initialValues: PropTypes.shape({
      title: PropTypes.string,
      description: PropTypes.string,
      published: PropTypes.bool,
      // Badge types to preview existing images
      badge: PropTypes.shape({
        name: PropTypes.string,
        url: PropTypes.string,
      }),
    }),
    notification: notificationShape,
  };

  onFormSubmit = (data) => {
    const attributes = { ...data };
    const { intl } = this.props;

    return this.props.dispatch(
      actions.updateAchievement(
        data.id,
        { achievement: attributes },
        intl.formatMessage(translations.updateSuccess),
        intl.formatMessage(translations.updateFailure)
      )
    );
  };

  render() {
    const { initialValues, conditionAttributes, dispatch } = this.props;

    return (
      <div>
        <AchievementForm
          editing
          onSubmit={this.onFormSubmit}
          conditionAttributes={conditionAttributes}
          initialValues={initialValues}
        />
        <div style={styles.buttonContainer}>
          <RaisedButton
            label={<FormattedMessage {...translations.updateAchievement} />}
            primary
            className="btn-submit"
            disabled={this.props.disabled}
            onTouchTap={() => dispatch(submit(formNames.ACHIEVEMENT))}
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
