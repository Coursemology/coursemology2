import React from 'react';
import PropTypes from 'prop-types';
import { TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import { grey300 } from 'material-ui/styles/colors';
import styles from './../pages/Level/LevelView.scss';

class LevelRow extends React.Component {
  static propTypes = {
    levelNumber: PropTypes.number.isRequired,
    experiencePointsThreshold: PropTypes.number.isRequired,
  }

  levelDeleteHandler(levelNumber) {
    return (e) => {
      e.preventDefault();
      if (!this.props.isLoading) {
        console.log('delete ' + levelNumber);
      }
    };
  }

  renderInput(levelNumber, experiencePointsThreshold) {
    return (
      <TextField
        type="text"
        name={'level_' + levelNumber}
        onChange={(e, newValue) => {
          this.props.updateExpThreshold(levelNumber, newValue);
        }}
        value={experiencePointsThreshold}
      />
    );
  }

  render() {
    const { levelNumber, experiencePointsThreshold } = this.props;
    return (
      <TableRow>
        <TableHeaderColumn className={styles.deleteButtonCell}>
          <RaisedButton
            name={levelNumber}
            backgroundColor={grey300}
            icon={<i className="fa fa-trash" />}
            onClick={this.levelDeleteHandler(levelNumber)}
            style={{ minWidth: '40px', width: '40px' }}
          />
        </TableHeaderColumn>
        <TableRowColumn>{ levelNumber }</TableRowColumn>
        <TableRowColumn>{ this.renderInput(levelNumber, experiencePointsThreshold) }</TableRowColumn>
      </TableRow>
    );
  }
}

export default LevelRow;
