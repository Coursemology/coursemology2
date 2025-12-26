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

import Section from 'lib/components/core/layouts/Section';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import messagesTranslations from 'lib/translations/messages';

import {
  fetchNotificationSettings,
  updateNotificationSettings,
} from './operations';
import translations, {
  settingComponents,
  settingDescriptions,
  settingTitles,
} from './translations.intl';

class NotificationSettings extends Component {
  constructor(props) {
    super(props);
    this.state = { isLoading: true };
  }

  componentDidMount() {
    this.props.dispatch(
      fetchNotificationSettings(
        () => this.setState({ isLoading: false }),
        <FormattedMessage {...messagesTranslations.fetchingError} />,
      ),
    );
  }

  handleComponentNotificationSettingUpdate = (setting, type) => {
    const { dispatch, intl } = this.props;
    const componentTitle =
      setting.component_title ??
      (settingComponents[setting.component]
        ? intl.formatMessage(settingComponents[setting.component])
        : setting.component);
    const settingTitle = settingTitles[setting.setting]
      ? intl.formatMessage(settingTitles[setting.setting])
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
        updateNotificationSettings(payload, successMessage, failureMessage),
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
              <FormattedMessage {...translations.component} />
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
        <TableCell className="whitespace-normal break-words" colSpan={6}>
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
    if (this.state.isLoading) return <LoadingIndicator />;

    return (
      <Section
        contentClassName="flex flex-col space-y-3"
        sticksToNavbar
        title={<FormattedMessage {...translations.emailSettings} />}
      >
        {this.renderEmailSettingsTable()}
      </Section>
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
  intl: PropTypes.object.isRequired,
};

export default connect((state) => ({
  emailSettings: state.courseSettings.notificationSettings,
}))(injectIntl(NotificationSettings));
