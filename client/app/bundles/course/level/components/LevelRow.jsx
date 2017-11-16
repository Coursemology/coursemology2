import React from 'react';
import PropTypes from 'prop-types';
import { TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import { grey300 } from 'material-ui/styles/colors';

const styles = {
  deleteButtonCell: {
    paddingLeft: 0,
    textAlign: 'right',
    verticalAlign: 'middle',
    width: '50px',
  },
  levelNumber: {
    fontSize: '16px',
    textAlign: 'center',
    verticalAlign: 'middle',
  },
}

class LevelRow extends React.Component {
  static propTypes = {
    levelNumber: PropTypes.number.isRequired,
    experiencePointsThreshold: PropTypes.number.isRequired,
  }

  renderInput(levelNumber, experiencePointsThreshold) {
    return (
      <TextField
        type="text"
        name={'level_' + levelNumber}
        onChange={(e, newValue) => {
          this.props.updateExpThreshold(levelNumber, newValue);
        }}
        onBlur={(e) => { this.props.sortLevels() }}
        value={experiencePointsThreshold}
      />
    );
  }

  render() {
    const { levelNumber, experiencePointsThreshold } = this.props;
    return (
      <TableRow>
        <TableRowColumn style={styles.levelNumber}>{ levelNumber }</TableRowColumn>
        <TableRowColumn>{ this.renderInput(levelNumber, experiencePointsThreshold) }</TableRowColumn>
        <TableHeaderColumn style={styles.deleteButtonCell}>
          <RaisedButton
            name={levelNumber}
            backgroundColor={grey300}
            icon={<i className="fa fa-trash" />}
            onClick={this.props.deleteLevel(levelNumber)}
            style={{ minWidth: '40px', width: '40px' }}
          />
        </TableHeaderColumn>
      </TableRow>
    );
  }
}

export default LevelRow;
