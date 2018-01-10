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
      options: PropTypes.shape({}),
    })),
    dispatch: PropTypes.func.isRequired,
  };

  handleLessonPlanItemSettingUpdate = (setting) => {
    const { dispatch } = this.props;
    const { component, tab_title, options } = setting;
    return (_, enabled) => {
      const payload = { component, tab_title, enabled, options };
      const successMessage = <FormattedMessage {...translations.updateSuccess} values={{ setting: tab_title }} />;
      const failureMessage = <FormattedMessage {...translations.updateFailure} values={{ setting: tab_title }} />;
      dispatch(updateLessonPlanItemSetting(payload, successMessage, failureMessage));
    };
  }

  renderRow(setting) {
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
            onToggle={this.handleLessonPlanItemSettingUpdate(setting)}
          />
        </TableRowColumn>
      </TableRow>
    );
  }

  renderLessonPlanItemSettingsTable() {
    const { lessonPlanItemSettings } = this.props;

    if (lessonPlanItemSettings.length < 1) {
      return <Subheader><FormattedMessage {...translations.noLessonPlanItems} /></Subheader>;
    }

    return (
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
          </TableRow>
        </TableHeader>
        <TableBody
          displayRowCheckbox={false}
        >
          { lessonPlanItemSettings.map(item => this.renderRow(item)) }
        </TableBody>
      </Table>
    );
  }

  render() {
    return (
      <div>
        <h2><FormattedMessage {...translations.lessonPlanItemSettings} /></h2>
        {this.renderLessonPlanItemSettingsTable()}

        <NotificationPopup />
      </div>
    );
  }
}

export default connect(state => ({
  lessonPlanItemSettings: state.lessonPlanItemSettings,
}))(LessonPlanItemSettings);
