/* eslint-disable camelcase */
import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import {
  ListSubheader,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import NotificationPopup from 'lib/containers/NotificationPopup';
import { updateLessonPlanSettings } from 'course/admin/actions/lesson-plan-items';
import translations from './translations.intl';
import MilestoneGroupSettings from './MilestoneGroupSettings';

class LessonPlanSettings extends Component {
  // Ensure both enabled and visible values are sent in the payload.
  // Send the current value for visible when changing enabled.
  handleLessonPlanItemEnabledUpdate = (setting) => {
    const { dispatch } = this.props;
    const { component, tab_title, component_title, options } = setting;
    return (_, enabled) => {
      const payload = {
        lesson_plan_item_settings: {
          component,
          tab_title,
          enabled,
          visible: setting.visible,
          options,
        },
      };
      const values = { setting: tab_title || component_title };
      const successMessage = (
        <FormattedMessage {...translations.updateSuccess} values={values} />
      );
      const failureMessage = (
        <FormattedMessage {...translations.updateFailure} values={values} />
      );
      dispatch(
        updateLessonPlanSettings(payload, successMessage, failureMessage),
      );
    };
  };

  // Ensure both enabled and visible values are sent in the payload
  // Send the current value for enabled when changing visible.
  handleLessonPlanItemVisibleUpdate = (setting) => {
    const { dispatch } = this.props;
    const { component, tab_title, component_title, options } = setting;
    return (_, visible) => {
      const payload = {
        lesson_plan_item_settings: {
          component,
          tab_title,
          visible,
          enabled: setting.enabled,
          options,
        },
      };
      const values = { setting: tab_title || component_title };
      const successMessage = (
        <FormattedMessage {...translations.updateSuccess} values={values} />
      );
      const failureMessage = (
        <FormattedMessage {...translations.updateFailure} values={values} />
      );
      dispatch(
        updateLessonPlanSettings(payload, successMessage, failureMessage),
      );
    };
  };

  renderAssessmentSettingRow(setting) {
    const categoryTitle = setting.category_title || setting.component;
    const tabTitle = setting.tab_title;

    return (
      <TableRow
        key={setting.component + setting.category_title + setting.tab_title}
      >
        <TableCell colSpan={2}>{categoryTitle}</TableCell>
        <TableCell colSpan={3}>{tabTitle}</TableCell>
        <TableCell>
          <Switch
            checked={setting.enabled}
            color="primary"
            onChange={this.handleLessonPlanItemEnabledUpdate(setting)}
          />
        </TableCell>
        <TableCell>
          <Switch
            checked={setting.visible}
            color="primary"
            onChange={this.handleLessonPlanItemVisibleUpdate(setting)}
          />
        </TableCell>
      </TableRow>
    );
  }

  renderComponentSettingRow(setting) {
    const componentTitle = setting.component_title || setting.component;

    return (
      <TableRow key={setting.component}>
        <TableCell colSpan={5}>{componentTitle}</TableCell>
        <TableCell>
          <Switch
            checked={setting.enabled}
            color="primary"
            onChange={this.handleLessonPlanItemEnabledUpdate(setting)}
          />
        </TableCell>
        <TableCell>
          <Switch
            checked={setting.visible}
            color="primary"
            onChange={this.handleLessonPlanItemVisibleUpdate(setting)}
          />
        </TableCell>
      </TableRow>
    );
  }

  // For the assessments component, as settings are for categories and tabs.
  renderLessonPlanItemAssessmentSettingsTable() {
    const { lessonPlanItemSettings } = this.props;
    const assessmentItemSettings = lessonPlanItemSettings.filter(
      (setting) => setting.component === 'course_assessments_component',
    );

    if (assessmentItemSettings.length < 1) {
      return (
        <ListSubheader disableSticky>
          <FormattedMessage {...translations.noLessonPlanItems} />
        </ListSubheader>
      );
    }

    return (
      <>
        <h3>
          <FormattedMessage
            {...translations.lessonPlanAssessmentItemSettings}
          />
        </h3>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell colSpan={2}>
                <FormattedMessage {...translations.assessmentCategory} />
              </TableCell>
              <TableCell colSpan={3}>
                <FormattedMessage {...translations.assessmentTab} />
              </TableCell>
              <TableCell>
                <FormattedMessage {...translations.enabled} />
              </TableCell>
              <TableCell>
                <FormattedMessage {...translations.visible} />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assessmentItemSettings.map((item) =>
              this.renderAssessmentSettingRow(item),
            )}
          </TableBody>
        </Table>
      </>
    );
  }

  // For the video and survey components, as settings are for component only.
  renderLessonPlanItemSettingsForComponentsTable() {
    const { lessonPlanItemSettings } = this.props;
    const componentItemSettings = lessonPlanItemSettings.filter((setting) =>
      ['course_videos_component', 'course_survey_component'].includes(
        setting.component,
      ),
    );

    if (componentItemSettings.length < 1) {
      return (
        <ListSubheader disableSticky>
          <FormattedMessage {...translations.noLessonPlanItems} />
        </ListSubheader>
      );
    }

    return (
      <>
        <h3>
          <FormattedMessage {...translations.lessonPlanComponentItemSettings} />
        </h3>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell colSpan={5}>
                <FormattedMessage {...translations.component} />
              </TableCell>
              <TableCell>
                <FormattedMessage {...translations.enabled} />
              </TableCell>
              <TableCell>
                <FormattedMessage {...translations.visible} />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {componentItemSettings.map((item) =>
              this.renderComponentSettingRow(item),
            )}
          </TableBody>
        </Table>
      </>
    );
  }

  render() {
    return (
      <>
        <MilestoneGroupSettings />

        <h2>
          <FormattedMessage {...translations.lessonPlanItemSettings} />
        </h2>
        {this.renderLessonPlanItemAssessmentSettingsTable()}
        {this.renderLessonPlanItemSettingsForComponentsTable()}

        <NotificationPopup />
      </>
    );
  }
}

LessonPlanSettings.propTypes = {
  lessonPlanItemSettings: PropTypes.arrayOf(
    PropTypes.shape({
      component: PropTypes.string,
      category_title: PropTypes.string,
      tab_title: PropTypes.string,
      enabled: PropTypes.bool,
      visible: PropTypes.bool,
      options: PropTypes.shape({}),
    }),
  ),
  dispatch: PropTypes.func.isRequired,
};

export default connect((state) => ({
  lessonPlanItemSettings: state.lessonPlanSettings.items_settings,
}))(LessonPlanSettings);
