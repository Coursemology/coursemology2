import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import Subheader from 'material-ui/Subheader';
import Toggle from 'material-ui/Toggle';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
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

class UserEmailSubscriptions extends React.Component {
  handleFetchAllUserEmailSubscriptions = () => {
    const { dispatch } = this.props;
    dispatch(fetchUserEmailSubscriptions());
  };

  handleUserEmailSubscriptionsUpdate = (setting) => {
    const { userEmailSubscriptionsPageFilter, dispatch } = this.props;
    const componentTitle =
      setting.component_title ||
      (subscriptionComponents[setting.component] &&
        subscriptionComponents[setting.component].defaultMessage) ||
      setting.component;
    const settingTitle =
      (subscriptionTitles[setting.setting] &&
        subscriptionTitles[setting.setting].defaultMessage) ||
      setting.setting;
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

  renderRow(setting) {
    const componentTitle =
      setting.component_title ||
      (subscriptionComponents[setting.component] && (
        <FormattedMessage {...subscriptionComponents[setting.component]} />
      )) ||
      setting.component;
    const settingTitle =
      (subscriptionTitles[setting.setting] && (
        <FormattedMessage {...subscriptionTitles[setting.setting]} />
      )) ||
      setting.setting;
    const settingDescription =
      (subscriptionDescriptions[`${setting.component}_${setting.setting}`] && (
        <FormattedMessage
          {...subscriptionDescriptions[
            `${setting.component}_${setting.setting}`
          ]}
        />
      )) ||
      '';
    return (
      <TableRow
        key={
          setting.component +
          setting.course_assessment_category_id +
          setting.setting
        }
      >
        <TableRowColumn colSpan={2}>{componentTitle}</TableRowColumn>
        <TableRowColumn colSpan={3}>{settingTitle}</TableRowColumn>
        <TableRowColumn colSpan={7} style={styles.wrapText}>
          {settingDescription}
        </TableRowColumn>
        <TableRowColumn>
          <Toggle
            toggled={setting.enabled}
            onToggle={this.handleUserEmailSubscriptionsUpdate(setting)}
          />
        </TableRowColumn>
      </TableRow>
    );
  }

  renderEmailSettingsTable() {
    const { userEmailSubscriptions } = this.props;

    if (userEmailSubscriptions.length === 0) {
      return (
        <Subheader>
          <FormattedMessage {...translations.noEmailSubscriptionSettings} />
        </Subheader>
      );
    }

    return (
      <Table>
        <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
          <TableRow>
            <TableHeaderColumn colSpan={2}>
              <FormattedMessage {...translations.component} />
            </TableHeaderColumn>
            <TableHeaderColumn colSpan={3}>
              <FormattedMessage {...translations.setting} />
            </TableHeaderColumn>
            <TableHeaderColumn colSpan={7}>
              <FormattedMessage {...translations.description} />
            </TableHeaderColumn>
            <TableHeaderColumn>
              <FormattedMessage {...translations.enabled} />
            </TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
          {userEmailSubscriptions.map((item) => this.renderRow(item))}
        </TableBody>
      </Table>
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
