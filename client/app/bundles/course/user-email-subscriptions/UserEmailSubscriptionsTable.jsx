import { Component } from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import {
  ListSubheader,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import PropTypes from 'prop-types';

import { setNotification } from 'lib/actions';
import Page from 'lib/components/core/layouts/Page';
import Link from 'lib/components/core/Link';

import {
  fetchUserEmailSubscriptions,
  updateUserEmailSubscriptions,
} from './operations';
import translations, {
  subscriptionComponents,
  subscriptionDescriptions,
  subscriptionTitles,
} from './translations';

const styles = {
  wrapText: {
    whiteSpace: 'normal',
    wordWrap: 'break-word',
  },
};

class UserEmailSubscriptionsTable extends Component {
  handleFetchAllUserEmailSubscriptions = () => {
    const { dispatch } = this.props;
    dispatch(fetchUserEmailSubscriptions());
  };

  handleUserEmailSubscriptionsUpdate = (setting) => {
    const { userEmailSubscriptionsPageFilter, dispatch, intl } = this.props;
    const componentTitle =
      setting.component_title ??
      (subscriptionComponents[setting.component]
        ? intl.formatMessage(subscriptionComponents[setting.component])
        : setting.component);
    const settingTitle = subscriptionTitles[setting.setting]
      ? intl.formatMessage(subscriptionTitles[setting.setting])
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
      <Page
        title={<FormattedMessage {...translations.emailSubscriptions} />}
        unpadded
      >
        {this.renderEmailSettingsTable()}
        {!this.props.userEmailSubscriptionsPageFilter.show_all_settings && (
          <Link
            className="cursor-pointer"
            onClick={this.handleFetchAllUserEmailSubscriptions}
          >
            <FormattedMessage
              {...translations.viewAllEmailSubscriptionSettings}
            />
          </Link>
        )}
      </Page>
    );
  }
}

UserEmailSubscriptionsTable.propTypes = {
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
  intl: PropTypes.object.isRequired,
};

export default connect(({ userEmailSubscriptions }) => ({
  userEmailSubscriptions: userEmailSubscriptions.settings,
  userEmailSubscriptionsPageFilter: userEmailSubscriptions.pageFilter,
}))(injectIntl(UserEmailSubscriptionsTable));
