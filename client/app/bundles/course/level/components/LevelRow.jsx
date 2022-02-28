import { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Button, TableRow, TableCell, TextField } from '@material-ui/core';
import Delete from '@material-ui/icons/Delete';

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
      <Button
        variant="contained"
        color="secondary"
        disabled={disabled}
        id={`delete_${levelNumber}`}
        name={`delete_${levelNumber}`}
        onClick={deleteLevel(levelNumber)}
        style={{ minWidth: '40px', width: '40px' }}
      >
        <Delete />
      </Button>
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
        error={experiencePointsThreshold === 0}
        helperText={
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
        onChange={(event) => {
          updateExpThreshold(levelNumber, event.target.value);
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
        <TableCell style={styles.levelNumber}>{levelNumber}</TableCell>
        <TableCell style={styles.threshold}>
          {canManage ? this.renderInput() : experiencePointsThreshold}
        </TableCell>
        <TableCell style={styles.deleteButtonCell}>
          {canManage && this.renderDeleteButton()}
        </TableCell>
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
