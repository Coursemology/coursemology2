import { Component } from 'react';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import PropTypes from 'prop-types';
import { submit } from 'redux-form';

import NotificationBar, {
  notificationShape,
} from 'lib/components/NotificationBar';
import { achievementTypesConditionAttributes } from 'lib/types';

import * as actions from '../../actions';
import { formNames } from '../../constants';
import AchievementForm from '../../containers/AchievementForm';

import translations from './translations.intl';

const styles = {
  buttonContainer: {
    marginTop: 16,
    marginLeft: 16,
  },
};

class EditPage extends Component {
  onFormSubmit = (data) => {
    const attributes = { ...data };
    const { intl } = this.props;

    return this.props.dispatch(
      actions.updateAchievement(
        data.id,
        { achievement: attributes },
        intl.formatMessage(translations.updateSuccess),
        intl.formatMessage(translations.updateFailure),
      ),
    );
  };

  render() {
    const { initialValues, conditionAttributes, dispatch } = this.props;

    return (
      <>
        <AchievementForm
          conditionAttributes={conditionAttributes}
          editing={true}
          initialValues={initialValues}
          onSubmit={this.onFormSubmit}
        />
        <div style={styles.buttonContainer}>
          <RaisedButton
            className="btn-submit"
            disabled={this.props.disabled}
            label={<FormattedMessage {...translations.updateAchievement} />}
            onClick={() => dispatch(submit(formNames.ACHIEVEMENT))}
            primary={true}
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
  disabled: PropTypes.bool,
  conditionAttributes: achievementTypesConditionAttributes,
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

export default connect((state) => state.editPage)(injectIntl(EditPage));
