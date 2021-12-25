import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import RaisedButton from 'material-ui/RaisedButton';
import { grey300 } from 'material-ui/styles/colors';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import { TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import TextField from 'material-ui/TextField';
import PropTypes from 'prop-types';

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

class LevelRow extends Component {
  renderDeleteButton() {
    const { deleteLevel, disabled, levelNumber } = this.props;

    return (
      <RaisedButton
        backgroundColor={grey300}
        disabled={disabled}
        icon={<DeleteIcon />}
        id={`delete_${levelNumber}`}
        name={`delete_${levelNumber}`}
        onClick={deleteLevel(levelNumber)}
        style={{ minWidth: '40px', width: '40px' }}
      />
    );
  }

  renderInput() {
    const {
      disabled,
      experiencePointsThreshold,
      levelNumber,
      sortLevels,
      updateExpThreshold,
    } = this.props;
    return (
      <TextField
        disabled={disabled}
        errorText={
          experiencePointsThreshold === 0 ? (
            <FormattedMessage {...translations.zeroThresholdError} />
          ) : (
            ''
          )
        }
        name={`level_${levelNumber}`}
        onBlur={() => {
          sortLevels();
        }}
        onChange={(e, newValue) => {
          updateExpThreshold(levelNumber, newValue);
        }}
        type="text"
        value={experiencePointsThreshold}
      />
    );
  }

  render() {
    const { canManage, experiencePointsThreshold, levelNumber } = this.props;

    return (
      <TableRow>
        <TableRowColumn style={styles.levelNumber}>
          {levelNumber}
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

LevelRow.propTypes = {
  canManage: PropTypes.bool.isRequired,
  deleteLevel: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  experiencePointsThreshold: PropTypes.number.isRequired,
  levelNumber: PropTypes.number.isRequired,
  sortLevels: PropTypes.func.isRequired,
  updateExpThreshold: PropTypes.func.isRequired,
};

export default LevelRow;
