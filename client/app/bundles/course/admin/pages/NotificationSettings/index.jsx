import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import {
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@material-ui/core';
import { ListSubheader } from '@mui/material';
import NotificationPopup from 'lib/containers/NotificationPopup';
import { updateNotificationSetting } from 'course/admin/actions/notifications';
import adminTranslations from 'course/translations.intl';
import translations, {
  settingComponents,
  settingTitles,
  settingDescriptions,
} from './translations.intl';

const styles = {
  wrapText: {
    whiteSpace: 'normal',
    wordWrap: 'break-word',
  },
};

class NotificationSettings extends Component {
  handleComponentNotificationSettingUpdate = (setting, type) => {
    const { dispatch } = this.props;
    const componentTitle =
      setting.component_title ??
      (settingComponents[setting.component]
        ? settingComponents[setting.component].defaultMessage
        : setting.component);
    const settingTitle = settingTitles[setting.setting]
      ? settingTitles[setting.setting].defaultMessage
      : setting.setting;

    return (_, enabled) => {
      const payload = {
        email_settings: {
          component: setting.component,
          course_assessment_category_id: setting.course_assessment_category_id,
          setting: setting.setting,
        },
      };
      payload.email_settings[type] = enabled;
      const userText = type === 'phantom' ? 'phantom' : 'regular';
      const enabledText = enabled ? 'enabled' : 'disabled';
      const successMessage = (
        <FormattedMessage
          {...translations.updateSuccess}
          values={{
            setting: `${componentTitle} (${settingTitle})`,
            user: userText,
            action: enabledText,
          }}
        />
      );
      const failureMessage = (
        <FormattedMessage
          {...translations.updateFailure}
          values={{
            setting: `${componentTitle} (${settingTitle})`,
            user: userText,
            action: enabledText,
          }}
        />
      );
      dispatch(
        updateNotificationSetting(payload, successMessage, failureMessage),
      );
    };
  };

  renderEmailSettingsTable() {
    const { emailSettings } = this.props;

    if (emailSettings.length < 1) {
      return (
        <ListSubheader disableSticky>
          <FormattedMessage {...translations.noEmailSettings} />
        </ListSubheader>
      );
    }

    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell colSpan={1}>
              <FormattedMessage {...adminTranslations.component} />
            </TableCell>
            <TableCell colSpan={2}>
              <FormattedMessage {...translations.setting} />
            </TableCell>
            <TableCell colSpan={6}>
              <FormattedMessage {...translations.description} />
            </TableCell>
            <TableCell>
              <FormattedMessage {...translations.phantom} />
            </TableCell>
            <TableCell>
              <FormattedMessage {...translations.regular} />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {emailSettings.map((item) => this.renderRow(item))}
        </TableBody>
      </Table>
    );
  }

  renderRow(setting) {
    const componentTitle =
      setting.title ??
      (settingComponents[setting.component] ? (
        <FormattedMessage {...settingComponents[setting.component]} />
      ) : (
        setting.component
      ));
    const settingTitle = settingTitles[setting.setting] ? (
      <FormattedMessage {...settingTitles[setting.setting]} />
    ) : (
      setting.setting
    );
    const settingDescription = settingDescriptions[
      `${setting.component}_${setting.setting}`
    ] ? (
      <FormattedMessage
        {...settingDescriptions[`${setting.component}_${setting.setting}`]}
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
        <TableCell colSpan={1}>{componentTitle}</TableCell>
        <TableCell colSpan={2}>{settingTitle}</TableCell>
        <TableCell colSpan={6} style={styles.wrapText}>
          {settingDescription}
        </TableCell>
        <TableCell>
          <Switch
            checked={setting.phantom}
            color="primary"
            onChange={this.handleComponentNotificationSettingUpdate(
              setting,
              'phantom',
            )}
          />
        </TableCell>
        <TableCell>
          <Switch
            checked={setting.regular}
            color="primary"
            onChange={this.handleComponentNotificationSettingUpdate(
              setting,
              'regular',
            )}
          />
        </TableCell>
      </TableRow>
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
      course_assessment_category_id: PropTypes.number,
      setting: PropTypes.string,
      phantom: PropTypes.bool,
      regular: PropTypes.bool,
    }),
  ),
  dispatch: PropTypes.func.isRequired,
};

export default connect((state) => ({
  emailSettings: state.notificationSettings,
}))(NotificationSettings);
