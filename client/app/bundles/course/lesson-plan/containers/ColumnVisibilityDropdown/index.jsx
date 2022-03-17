import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Button, MenuItem, MenuList, Popover } from '@material-ui/core';
import Done from '@mui/icons-material/Done';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import { setColumnVisibility } from 'course/lesson-plan/actions';
import { fields } from 'course/lesson-plan/constants';
import fieldTranslations from 'course/lesson-plan/translations';

const { ITEM_TYPE, START_AT, BONUS_END_AT, END_AT, PUBLISHED } = fields;

const translations = defineMessages({
  label: {
    id: 'course.lessonPlan.ColumnVisibilityDropdown.label',
    defaultMessage: 'Toggle Column Visibility',
  },
});

const styles = {
  dropdown: {
    display: 'inline-block',
    marginLeft: 16,
  },
};

class ColumnVisibilityDropdown extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
    };
  }

  handleClick = (event) => {
    // This prevents ghost click.
    event.preventDefault();

    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  };

  handleRequestClose = () => {
    this.setState({
      open: false,
    });
  };

  render() {
    const { dispatch, columnsVisible } = this.props;

    return (
      <div style={styles.dropdown}>
        <Button
          variant="contained"
          color="secondary"
          endIcon={<KeyboardArrowDown />}
          onClick={this.handleClick}
        >
          <FormattedMessage {...translations.label} />
        </Button>
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          onClose={this.handleRequestClose}
          transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        >
          <MenuList style={{ maxHeight: 450 }}>
            {[ITEM_TYPE, START_AT, BONUS_END_AT, END_AT, PUBLISHED].map(
              (field) => {
                const isVisible = columnsVisible[field];
                return (
                  <MenuItem
                    key={field}
                    onClick={() =>
                      dispatch(setColumnVisibility(field, !isVisible))
                    }
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <FormattedMessage {...fieldTranslations[field]} />
                    {isVisible && <Done />}
                  </MenuItem>
                );
              },
            )}
          </MenuList>
        </Popover>
      </div>
    );
  }
}

ColumnVisibilityDropdown.propTypes = {
  columnsVisible: PropTypes.shape({}).isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect((state) => ({
  columnsVisible: state.flags.editPageColumnsVisible,
}))(ColumnVisibilityDropdown);
