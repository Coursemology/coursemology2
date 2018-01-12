import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import Subheader from 'material-ui/Subheader';
import Toggle from 'material-ui/Toggle';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import NotificationPopup from 'lib/containers/NotificationPopup';
import { updateLessonPlanItemSetting } from 'course/admin/actions/lesson-plan-items';
import translations from './translations.intl';

class LessonPlanItemSettings extends React.Component {
  static propTypes = {
    lessonPlanItemSettings: PropTypes.arrayOf(PropTypes.shape({
      component: PropTypes.string,
      category_title: PropTypes.string,
      tab_title: PropTypes.string,
      enabled: PropTypes.bool,
      visible: PropTypes.bool,
      options: PropTypes.shape({}),
    })),
    dispatch: PropTypes.func.isRequired,
  };

  // Ensure both enabled and visible values are sent in the payload.
  // Send the current value for visible when changing enabled.
  handleLessonPlanItemEnabledUpdate = (setting) => {
    const { dispatch } = this.props;
    const { component, tab_title, component_title, options } = setting;
    return (_, enabled) => {
      const payload = { component, tab_title, enabled, visible: setting.visible, options };
      const successMessage = <FormattedMessage {...translations.updateSuccess} values={{ setting: tab_title || component_title }} />;
      const failureMessage = <FormattedMessage {...translations.updateFailure} values={{ setting: tab_title || component_title }} />;
      dispatch(updateLessonPlanItemSetting(payload, successMessage, failureMessage));
    };
  }

  // Ensure both enabled and visible values are sent in the payload
  // Send the current value for enabled when changing visible.
  handleLessonPlanItemVisibleUpdate = (setting) => {
    const { dispatch } = this.props;
    const { component, tab_title, component_title, options } = setting;
    return (_, visible) => {
      const payload = { component, tab_title, visible, enabled: setting.enabled, options };
      const successMessage = <FormattedMessage {...translations.updateSuccess} values={{ setting: tab_title || component_title }} />;
      const failureMessage = <FormattedMessage {...translations.updateFailure} values={{ setting: tab_title || component_title }} />;
      dispatch(updateLessonPlanItemSetting(payload, successMessage, failureMessage));
    };
  }

  renderAssessmentSettingRow(setting) {
    const categoryTitle = setting.category_title || setting.component;
    const tabTitle = setting.tab_title;

    return (
      <TableRow key={setting.component + setting.category_title + setting.tab_title}>
        <TableRowColumn colSpan={2}>
          { categoryTitle }
        </TableRowColumn>
        <TableRowColumn colSpan={3}>
          { tabTitle }
        </TableRowColumn>
        <TableRowColumn>
          <Toggle
            toggled={setting.enabled}
            onToggle={this.handleLessonPlanItemEnabledUpdate(setting)}
          />
        </TableRowColumn>
        <TableRowColumn>
          <Toggle
            toggled={setting.visible}
            onToggle={this.handleLessonPlanItemVisibleUpdate(setting)}
          />
        </TableRowColumn>
      </TableRow>
    );
  }

  renderComponentSettingRow(setting) {
    const componentTitle = setting.component_title || setting.component;

    return (
      <TableRow key={setting.component}>
        <TableRowColumn colSpan={5}>
          { componentTitle }
        </TableRowColumn>
        <TableRowColumn>
          <Toggle
            toggled={setting.enabled}
            onToggle={this.handleLessonPlanItemEnabledUpdate(setting)}
          />
        </TableRowColumn>
        <TableRowColumn>
          <Toggle
            toggled={setting.visible}
            onToggle={this.handleLessonPlanItemVisibleUpdate(setting)}
          />
        </TableRowColumn>
      </TableRow>
    );
  }

  // For the assessments component, as settings are for categories and tabs.
  renderLessonPlanItemAssessmentSettingsTable() {
    const { lessonPlanItemSettings } = this.props;
    const assessmentItemSettings = lessonPlanItemSettings.filter(setting =>
      setting.component === 'course_assessments_component');

    if (assessmentItemSettings.length < 1) {
      return <Subheader><FormattedMessage {...translations.noLessonPlanItems} /></Subheader>;
    }

    return (
      <div>
        <h3><FormattedMessage {...translations.lessonPlanAssessmentItemSettings} /></h3>
        <Table>
          <TableHeader
            adjustForCheckbox={false}
            displaySelectAll={false}
          >
            <TableRow>
              <TableHeaderColumn colSpan={2}>
                <FormattedMessage {...translations.assessmentCategory} />
              </TableHeaderColumn>
              <TableHeaderColumn colSpan={3}>
                <FormattedMessage {...translations.assessmentTab} />
              </TableHeaderColumn>
              <TableHeaderColumn>
                <FormattedMessage {...translations.enabled} />
              </TableHeaderColumn>
              <TableHeaderColumn>
                <FormattedMessage {...translations.visible} />
              </TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody
            displayRowCheckbox={false}
          >
            { assessmentItemSettings.map(item => this.renderAssessmentSettingRow(item)) }
          </TableBody>
        </Table>
      </div>
    );
  }

  // For the video and survey components, as settings are for component only.
  renderLessonPlanItemSettingsForComponentsTable() {
    const { lessonPlanItemSettings } = this.props;
    const componentItemSettings = lessonPlanItemSettings.filter(setting =>
      ['course_videos_component', 'course_survey_component'].includes(setting.component));

    if (componentItemSettings.length < 1) {
      return <Subheader><FormattedMessage {...translations.noLessonPlanItems} /></Subheader>;
    }

    return (
      <div>
        <h3><FormattedMessage {...translations.lessonPlanComponentItemSettings} /></h3>
        <Table>
          <TableHeader
            adjustForCheckbox={false}
            displaySelectAll={false}
          >
            <TableRow>
              <TableHeaderColumn colSpan={5}>
                <FormattedMessage {...translations.component} />
              </TableHeaderColumn>
              <TableHeaderColumn>
                <FormattedMessage {...translations.enabled} />
              </TableHeaderColumn>
              <TableHeaderColumn>
                <FormattedMessage {...translations.visible} />
              </TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody
            displayRowCheckbox={false}
          >
            { componentItemSettings.map(item => this.renderComponentSettingRow(item)) }
          </TableBody>
        </Table>
      </div>
    );
  }

  render() {
    return (
      <div>
        <h2><FormattedMessage {...translations.lessonPlanItemSettings} /></h2>
        {this.renderLessonPlanItemAssessmentSettingsTable()}
        {this.renderLessonPlanItemSettingsForComponentsTable()}

        <NotificationPopup />
      </div>
    );
  }
}

export default connect(state => ({
  lessonPlanItemSettings: state.lessonPlanItemSettings,
}))(LessonPlanItemSettings);
