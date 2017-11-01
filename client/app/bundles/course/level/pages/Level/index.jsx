import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import mirrorCreator from 'mirror-creator';
import { isValid } from 'redux-form';

import Paper from 'material-ui/Paper';
import Avatar from 'material-ui/Avatar';
import List from 'material-ui/List/List';
import ListItem from 'material-ui/List/ListItem';
import { red500, cyan500, grey50 } from 'material-ui/styles/colors';
import Subheader from 'material-ui/Subheader';
import Clear from 'material-ui/svg-icons/content/clear';
import Done from 'material-ui/svg-icons/action/done';

import TitleBar from 'lib/components/TitleBar';
import LoadingIndicator from 'lib/components/LoadingIndicator';

import { fetchLevels } from 'course/level/actions';
import { defaultComponentTitles } from 'course/translations.intl';

import FlatButton from 'material-ui/FlatButton';
import {
  Table, TableBody, TableFooter, TableHeader, TableHeaderColumn, TableRow, TableRowColumn
} from 'material-ui/Table';

import LevelRow from 'course/level/components/LevelRow';

const translations = defineMessages({
  levelsTitle: {
    id: 'course.level.Level.levelsTitle',
    defaultMessage: 'Levels',
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
  countAvatar: {
    margin: 5,
  },
  duplicateButton: {
    display: 'flex',
    justifyContent: 'center',
  },
};

class Level extends React.Component {
  static propTypes = {
    isLoading: PropTypes.bool.isRequired,
    levels: PropTypes.array.isRequired,

    dispatch: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
    };
  }

  componentDidMount() {
    this.props.dispatch(fetchLevels());
  }
  
  renderBody() {
    const rows = this.props.levels.slice(1).map(level => (
      <LevelRow
        key={level.levelNumber}
        levelNumber={level.levelNumber}
        experiencePointsThreshold={level.experiencePointsThreshold}
        isLoading={this.props.isLoading}
      />
    ));

    return (
      <div style={styles.body}>
        <Table className="table levels-list">
          <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
            <TableRow>
              <TableHeaderColumn>Level</TableHeaderColumn>
              <TableHeaderColumn>Threshold</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableRowColumn colSpan="5" style={{ textAlign: 'center' }}>
                <FlatButton
                  icon={<i className="fa fa-plus" />}
                  label='Add new level'
                />
              </TableRowColumn>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    );
  }

  render() {
    return (
      <div>
        <TitleBar title={<FormattedMessage {...translations.levelsTitle} />} />
        { this.props.isLoading ? <LoadingIndicator /> : this.renderBody() }
      </div>
    );
  }
}

export default connect(({ levelEdit, ...state }) => ({
  isLoading: levelEdit.isLoading,
  levels: levelEdit.levels,
}))(Level);
