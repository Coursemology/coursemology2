import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Switch,
} from '@material-ui/core';
import { ListSubheader } from '@mui/material';
import NotificationPopup from 'lib/containers/NotificationPopup';
import {
  fetchUserEmailSubscriptions,
  updateUserEmailSubscriptions,
} from 'course/actions/user-email-subscriptions';
import { setNotification } from 'lib/actions';
import translations, {
  subscriptionComponents,
  subscriptionTitles,
  subscriptionDescriptions,
} from './translations.intl';

const styles = {
  wrapText: {
    whiteSpace: 'normal',
    wordWrap: 'break-word',
  },
};

class UserEmailSubscriptions extends Component {
  handleFetchAllUserEmailSubscriptions = () => {
    const { dispatch } = this.props;
    dispatch(fetchUserEmailSubscriptions());
  };

  handleUserEmailSubscriptionsUpdate = (setting) => {
    const { userEmailSubscriptionsPageFilter, dispatch } = this.props;
    const componentTitle =
      setting.component_title ??
      (subscriptionComponents[setting.component]
        ? subscriptionComponents[setting.component].defaultMessage
        : setting.component);
    const settingTitle = subscriptionTitles[setting.setting]
      ? subscriptionTitles[setting.setting].defaultMessage
      : setting.setting;
    return (_, enabled) => {
      const payloadSetting = { ...setting, enabled };
      const payloadPageFilter = { ...userEmailSubscriptionsPageFilter };
      const enabledText = enabled ? 'enabled' : 'disabled';
      const successMessage = (
        <FormattedMessage
          {...translations.updateSuccess}
          values={{
            topic: `${componentTitle} (${settingTitle})`,
            action: enabledText,
          }}
        />
      );
      const failureMessage = (
        <FormattedMessage
          {...translations.updateFailure}
          values={{
            topic: `${componentTitle} (${settingTitle})`,
            action: enabledText,
          }}
        />
      );
      dispatch(
        updateUserEmailSubscriptions(
          payloadSetting,
          payloadPageFilter,
          successMessage,
          failureMessage,
        ),
      );
    };
  };

  unsubscribeViaEmailSuccessful() {
    const { userEmailSubscriptionsPageFilter, dispatch } = this.props;
    const successMessage = (
      <FormattedMessage {...translations.unsubscribeSuccess} />
    );
    if (userEmailSubscriptionsPageFilter.unsubscribe_successful) {
      setNotification(successMessage)(dispatch);
    }
  }

  renderEmailSettingsTable() {
    const { userEmailSubscriptions } = this.props;

    if (userEmailSubscriptions.length === 0) {
      return (
        <ListSubheader disableSticky>
          <FormattedMessage {...translations.noEmailSubscriptionSettings} />
        </ListSubheader>
      );
    }

    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell colSpan={2}>
              <FormattedMessage {...translations.component} />
            </TableCell>
            <TableCell colSpan={3}>
              <FormattedMessage {...translations.setting} />
            </TableCell>
            <TableCell colSpan={7}>
              <FormattedMessage {...translations.description} />
            </TableCell>
            <TableCell>
              <FormattedMessage {...translations.enabled} />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {userEmailSubscriptions.map((item) => this.renderRow(item))}
        </TableBody>
      </Table>
    );
  }

  renderRow(setting) {
    const componentTitle =
      setting.component_title ??
      (subscriptionComponents[setting.component] ? (
        <FormattedMessage {...subscriptionComponents[setting.component]} />
      ) : (
        setting.component
      ));
    const settingTitle = subscriptionTitles[setting.setting] ? (
      <FormattedMessage {...subscriptionTitles[setting.setting]} />
    ) : (
      setting.setting
    );
    const settingDescription = subscriptionDescriptions[
      `${setting.component}_${setting.setting}`
    ] ? (
      <FormattedMessage
        {...subscriptionDescriptions[`${setting.component}_${setting.setting}`]}
      />
    ) : (
      ''
    );
    return (
      <TableRow
        key={
          setting.component +
          setting.course_assessment_category_id +
          setting.setting
        }
      >
        <TableCell colSpan={2}>{componentTitle}</TableCell>
        <TableCell colSpan={3}>{settingTitle}</TableCell>
        <TableCell colSpan={7} style={styles.wrapText}>
          {settingDescription}
        </TableCell>
        <TableCell>
          <Switch
            checked={setting.enabled}
            color="primary"
            onChange={this.handleUserEmailSubscriptionsUpdate(setting)}
          />
        </TableCell>
      </TableRow>
    );
  }

  render() {
    this.unsubscribeViaEmailSuccessful();
    return (
      <>
        <h2>
          <FormattedMessage {...translations.emailSubscriptions} />
        </h2>
        {this.renderEmailSettingsTable()}
        {!this.props.userEmailSubscriptionsPageFilter.show_all_settings && (
          <a onClick={this.handleFetchAllUserEmailSubscriptions}>
            <FormattedMessage
              {...translations.viewAllEmailSubscriptionSettings}
            />
          </a>
        )}
        <NotificationPopup />
      </>
    );
  }
}

UserEmailSubscriptions.propTypes = {
  userEmailSubscriptions: PropTypes.arrayOf(
    PropTypes.shape({
      component: PropTypes.string,
      component_title: PropTypes.string,
      course_assessment_category_id: PropTypes.number,
      setting: PropTypes.string,
      enabled: PropTypes.bool,
    }),
  ),
  userEmailSubscriptionsPageFilter: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
};

export default connect((state) => ({
  userEmailSubscriptions: state.userEmailSubscriptions.settings,
  userEmailSubscriptionsPageFilter: state.userEmailSubscriptions.pageFilter,
}))(UserEmailSubscriptions);
