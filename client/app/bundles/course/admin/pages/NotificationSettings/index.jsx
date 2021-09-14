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
import { updateNotificationSetting } from 'course/admin/actions/notifications';
import adminTranslations, {
  defaultComponentTitles,
} from 'course/translations.intl';
import translations, {
  settingTitles,
  settingDescriptions,
} from './translations.intl';

const styles = {
  wrapText: {
    whiteSpace: 'normal',
    wordWrap: 'break-word',
  },
};

class NotificationSettings extends React.Component {
  handleComponentNotificationSettingUpdate = (setting, settingTitle) => {
    const { dispatch } = this.props;
    const { component, key, options } = setting;
    return (_, enabled) => {
      const payload = { component, key, enabled, options };
      const successMessage = (
        <FormattedMessage
          {...translations.updateSuccess}
          values={{ setting: settingTitle }}
        />
      );
      const failureMessage = (
        <FormattedMessage
          {...translations.updateFailure}
          values={{ setting: settingTitle }}
        />
      );
      dispatch(
        updateNotificationSetting(payload, successMessage, failureMessage),
      );
    };
  };

  renderRow(setting) {
    const componentTitle =
      setting.component_title ||
      (defaultComponentTitles[setting.component] && (
        <FormattedMessage {...defaultComponentTitles[setting.component]} />
      )) ||
      setting.component;
    const settingTitle =
      (settingTitles[setting.key] && (
        <FormattedMessage {...settingTitles[setting.key]} />
      )) ||
      setting.key;
    const settingDescription =
      (settingDescriptions[setting.key] && (
        <FormattedMessage {...settingDescriptions[setting.key]} />
      )) ||
      '';

    return (
      <TableRow key={setting.component + setting.component_title + setting.key}>
        <TableRowColumn colSpan={2}>{componentTitle}</TableRowColumn>
        <TableRowColumn colSpan={3}>{settingTitle}</TableRowColumn>
        <TableRowColumn colSpan={7} style={styles.wrapText}>
          {settingDescription}
        </TableRowColumn>
        <TableRowColumn>
          <Toggle
            toggled={setting.enabled}
            onToggle={this.handleComponentNotificationSettingUpdate(
              setting,
              settingTitle,
            )}
          />
        </TableRowColumn>
      </TableRow>
    );
  }

  renderEmailSettingsTable() {
    const { emailSettings } = this.props;

    if (emailSettings.length < 1) {
      return (
        <Subheader>
          <FormattedMessage {...translations.noEmailSettings} />
        </Subheader>
      );
    }

    return (
      <Table>
        <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
          <TableRow>
            <TableHeaderColumn colSpan={2}>
              <FormattedMessage {...adminTranslations.component} />
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
          {emailSettings.map((item) => this.renderRow(item))}
        </TableBody>
      </Table>
    );
  }

  render() {
    return (
      <>
        <h2>
          <FormattedMessage {...translations.emailSettings} />
        </h2>
        {this.renderEmailSettingsTable()}

        <NotificationPopup />
      </>
    );
  }
}

NotificationSettings.propTypes = {
  emailSettings: PropTypes.arrayOf(
    PropTypes.shape({
      component: PropTypes.string,
      component_title: PropTypes.string,
      key: PropTypes.string,
      enabled: PropTypes.bool,
      options: PropTypes.shape({}),
    }),
  ),
  dispatch: PropTypes.func.isRequired,
};

export default connect((state) => ({
  emailSettings: state.notificationSettings,
}))(NotificationSettings);
