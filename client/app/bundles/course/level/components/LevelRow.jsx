import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import Delete from '@mui/icons-material/Delete';
import { IconButton, TableCell, TableRow, TextField } from '@mui/material';
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
      <IconButton
        className="-my-2"
        color="error"
        disabled={disabled}
        id={`delete_${levelNumber}`}
        name={`delete_${levelNumber}`}
        onClick={deleteLevel(levelNumber)}
        variant="contained"
      >
        <Delete />
      </IconButton>
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
          if (experiencePointsThreshold === '') return;

          sortLevels();
        }}
        onChange={(event) => {
          updateExpThreshold(levelNumber, event.target.value);
        }}
        type="text"
        value={experiencePointsThreshold}
        variant="standard"
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
