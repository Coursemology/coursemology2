import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage, intlShape } from 'react-intl';
import { Button } from '@mui/material';
import NotificationBar, {
  notificationShape,
} from 'lib/components/NotificationBar';
import { achievementTypesConditionAttributes } from 'lib/types';
import AchievementForm from '../../containers/AchievementForm';
import * as actions from '../../actions';
import translations from './translations.intl';

const styles = {
  buttonContainer: {
    marginTop: 16,
    marginLeft: 16,
  },
};

class EditPage extends Component {
  onFormSubmit = (data, setError) => {
    const attributes = { ...data };
    const { dispatch, intl } = this.props;

    return dispatch(
      actions.updateAchievement(
        data.id,
        { achievement: attributes },
        intl.formatMessage(translations.updateSuccess),
        intl.formatMessage(translations.updateFailure),
        setError,
      ),
    );
  };

  render() {
    const { initialValues, conditionAttributes, disabled, notification } =
      this.props;
    return (
      <>
        <AchievementForm
          disabled={disabled}
          editing
          onSubmit={this.onFormSubmit}
          conditionAttributes={conditionAttributes}
          initialValues={initialValues}
        />
        <div style={styles.buttonContainer}>
          <Button
            variant="contained"
            color="primary"
            className="btn-submit"
            disabled={disabled}
            form="achievement-form"
            type="submit"
          >
            <FormattedMessage {...translations.updateAchievement} />
          </Button>
        </div>
        <NotificationBar notification={notification} />
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
