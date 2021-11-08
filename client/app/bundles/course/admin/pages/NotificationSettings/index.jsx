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

class NotificationSettings extends React.Component {
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
        <TableRowColumn colSpan={2}>{componentTitle}</TableRowColumn>
        <TableRowColumn colSpan={3}>{settingTitle}</TableRowColumn>
        <TableRowColumn colSpan={7} style={styles.wrapText}>
          {settingDescription}
        </TableRowColumn>
        <TableRowColumn>
          <Toggle
            toggled={setting.phantom}
            onToggle={this.handleComponentNotificationSettingUpdate(
              setting,
              'phantom',
            )}
          />
        </TableRowColumn>
        <TableRowColumn>
          <Toggle
            toggled={setting.regular}
            onToggle={this.handleComponentNotificationSettingUpdate(
              setting,
              'regular',
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
              <FormattedMessage {...translations.phantom} />
            </TableHeaderColumn>
            <TableHeaderColumn>
              <FormattedMessage {...translations.regular} />
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
