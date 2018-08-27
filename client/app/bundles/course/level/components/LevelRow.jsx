import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import { TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import RaisedButton from 'material-ui/RaisedButton';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import TextField from 'material-ui/TextField';
import { grey300 } from 'material-ui/styles/colors';

const translations = defineMessages({
  zeroThresholdError: {
    id: 'course.level.LevelRow.zeroThresholdError',
    defaultMessage: 'Experience points threshold cannot be 0',
  },
});

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
  threshold: {
    fontSize: '16px',
    verticalAlign: 'middle',
  },
};

class LevelRow extends React.Component {
  static propTypes = {
    canManage: PropTypes.bool.isRequired,
    deleteLevel: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired,
    experiencePointsThreshold: PropTypes.number.isRequired,
    levelNumber: PropTypes.number.isRequired,
    sortLevels: PropTypes.func.isRequired,
    updateExpThreshold: PropTypes.func.isRequired,
  }

  renderInput() {
    const {
      disabled, experiencePointsThreshold, levelNumber, sortLevels, updateExpThreshold,
    } = this.props;
    return (
      <TextField
        type="text"
        name={`level_${levelNumber}`}
        onChange={(e, newValue) => {
          updateExpThreshold(levelNumber, newValue);
        }}
        disabled={disabled}
        errorText={experiencePointsThreshold === 0 ? <FormattedMessage {...translations.zeroThresholdError} /> : ''}
        onBlur={() => { sortLevels(); }}
        value={experiencePointsThreshold}
      />
    );
  }

  renderDeleteButton() {
    const { deleteLevel, disabled, levelNumber } = this.props;

    return (
      <RaisedButton
        id={`delete_${levelNumber}`}
        name={`delete_${levelNumber}`}
        backgroundColor={grey300}
        icon={<DeleteIcon />}
        onClick={deleteLevel(levelNumber)}
        disabled={disabled}
        style={{ minWidth: '40px', width: '40px' }}
      />
    );
  }

  render() {
    const { canManage, experiencePointsThreshold, levelNumber } = this.props;

    return (
      <TableRow>
        <TableRowColumn style={styles.levelNumber}>
          { levelNumber }
        </TableRowColumn>
        <TableRowColumn style={styles.threshold}>
          {canManage ? this.renderInput() : experiencePointsThreshold}
        </TableRowColumn>
        <TableHeaderColumn style={styles.deleteButtonCell}>
          {canManage && this.renderDeleteButton()}
        </TableHeaderColumn>
      </TableRow>
    );
  }
}

export default LevelRow;
