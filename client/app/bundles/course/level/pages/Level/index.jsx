import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';

import TitleBar from 'lib/components/TitleBar';
import LoadingIndicator from 'lib/components/LoadingIndicator';

import {
  fetchLevels,
  updateExpThreshold,
  sortLevels,
  addLevel,
  deleteLevel,
  saveLevels,
} from 'course/level/actions';
import { defaultComponentTitles } from 'course/translations.intl';

import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import {
  Table,
  TableBody,
  TableFooter,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

import LevelRow from 'course/level/components/LevelRow';

const translations = defineMessages({
  levelHeader: {
    id: 'course.level.Level.levelHeader',
    defaultMessage: 'Levels',
  },
  thresholdHeader: {
    id: 'course.level.Level.thresholdHeader',
    defaultMessage: 'Threshold',
  },
  addNewLevel: {
    id: 'course.level.Level.addNewLevel',
    defaultMessage: 'Add New Level',
  },
  saveLevels: {
    id: 'course.level.Level.saveLevels',
    defaultMessage: 'Save Levels',
  },
  saveSuccess: {
    id: 'course.level.Level.saveSuccess',
    defaultMessage: 'Levels Saved',
  },
  saveFailure: {
    id: 'course.level.Level.saveFailure',
    defaultMessage: 'Level saving failed, please try again.',
  },
});

const styles = {
  body: {
    display: 'flex',
  },
  sidebar: {
    width: 250,
  },
  mainPanel: {
    paddingLeft: 40,
    paddingRight: 40,
    width: '100%',
  },
  duplicateButton: {
    display: 'flex',
    justifyContent: 'center',
  },
  formButton: {
    marginRight: 10,
  },
  levelHeader: {
    textAlign: 'center',
  },
  thresholdHeader: {
    textAlign: 'left',
  },
  saveLevels: {
    textAlign: 'center',
  },
  addNewLevel: {
    textAlign: 'left',
  },
};

class Level extends React.Component {
  static renderTableHeader() {
    return (
      <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
        <TableRow>
          <TableHeaderColumn style={styles.levelHeader}>
            <FormattedMessage {...translations.levelHeader} />
          </TableHeaderColumn>
          <TableHeaderColumn style={styles.thresholdHeader}>
            <FormattedMessage {...translations.thresholdHeader} />
          </TableHeaderColumn>
          <TableHeaderColumn />
        </TableRow>
      </TableHeader>
    );
  }

  componentDidMount() {
    this.props.dispatch(fetchLevels());
  }

  handleUpdateExpThreshold = (levelNumber, newValue) => {
    this.props.dispatch(updateExpThreshold(levelNumber, newValue));
  };

  handleLevelTextBlur = () => {
    this.props.dispatch(sortLevels());
  };

  handleCreateLevel = () => (e) => {
    e.preventDefault();
    this.props.dispatch(addLevel());
  };

  handleDeleteLevel = (levelNumber) => (e) => {
    e.preventDefault();
    this.props.dispatch(deleteLevel(levelNumber));
  };

  handleSaveLevels = () => {
    const { dispatch, levels } = this.props;
    return (e) => {
      e.preventDefault();
      if (this.levelsHaveError() === false) {
        const successMessage = (
          <FormattedMessage {...translations.saveSuccess} />
        );
        const failureMessage = (
          <FormattedMessage {...translations.saveFailure} />
        );
        dispatch(saveLevels(levels, successMessage, failureMessage));
      }
    };
  };

  // Only the first element of the levels prop should be 0 as it is the default threshold.
  // User input should not contain any zeroes for threshold.
  levelsHaveError() {
    return this.props.levels.slice(1).some((element) => element === 0);
  }

  renderTableFooter() {
    const { isSaving } = this.props;

    return (
      <TableFooter adjustForCheckbox={false}>
        <TableRow>
          <TableRowColumn />
          <TableRowColumn colSpan="1" style={styles.addNewLevel}>
            <FlatButton
              id="add-level"
              icon={<i className="fa fa-plus" />}
              label={<FormattedMessage {...translations.addNewLevel} />}
              disabled={isSaving}
              onClick={this.handleCreateLevel()}
            />
          </TableRowColumn>
          <TableRowColumn />
        </TableRow>
        <TableRow>
          <TableRowColumn style={styles.saveLevels}>
            <RaisedButton
              id="save-levels"
              style={styles.formButton}
              type="submit"
              label={<FormattedMessage {...translations.saveLevels} />}
              disabled={isSaving}
              primary
              onClick={this.handleSaveLevels()}
            />
          </TableRowColumn>
          <TableRowColumn />
          <TableRowColumn />
        </TableRow>
      </TableFooter>
    );
  }

  renderBody() {
    const { canManage, levels, isSaving } = this.props;
    const rows = levels.slice(1).map((experiencePointsThreshold, index) => {
      const key = `level-row-${index}`;
      return (
        <LevelRow
          deleteLevel={this.handleDeleteLevel}
          disabled={isSaving}
          levelNumber={index + 1}
          sortLevels={this.handleLevelTextBlur}
          updateExpThreshold={this.handleUpdateExpThreshold}
          key={key}
          {...{ canManage, experiencePointsThreshold }}
        />
      );
    });

    return (
      <div style={styles.body}>
        <Table className="table levels-list" fixedHeader={false}>
          {Level.renderTableHeader()}
          <TableBody>{rows}</TableBody>
          {canManage && this.renderTableFooter()}
        </Table>
      </div>
    );
  }

  render() {
    return (
      <div>
        <TitleBar
          title={
            <FormattedMessage
              {...defaultComponentTitles.course_levels_component}
            />
          }
        />
        {this.props.isLoading ? <LoadingIndicator /> : this.renderBody()}
      </div>
    );
  }
}

Level.propTypes = {
  canManage: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isSaving: PropTypes.bool.isRequired,
  levels: PropTypes.arrayOf(PropTypes.number).isRequired,

  dispatch: PropTypes.func.isRequired,
};

export default connect(({ levelEdit }) => ({
  canManage: levelEdit.canManage,
  isLoading: levelEdit.isLoading,
  isSaving: levelEdit.isSaving,
  levels: levelEdit.levels,
}))(Level);
