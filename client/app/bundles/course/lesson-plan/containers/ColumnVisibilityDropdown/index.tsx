import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import Done from '@mui/icons-material/Done';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import { Button, MenuItem, MenuList, Popover } from '@mui/material';
import PropTypes from 'prop-types';

import { fields } from '../../constants';
import { actions } from '../../store';
import fieldTranslations from '../../translations';

const { ITEM_TYPE, START_AT, BONUS_END_AT, END_AT, PUBLISHED } = fields;

const translations = defineMessages({
  label: {
    id: 'course.lessonPlan.ColumnVisibilityDropdown.label',
    defaultMessage: 'Columns',
  },
});

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
      <>
        <Button
          color="secondary"
          endIcon={<KeyboardArrowDown />}
          onClick={this.handleClick}
          variant="contained"
        >
          <FormattedMessage {...translations.label} />
        </Button>

        <Popover
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          onClose={this.handleRequestClose}
          open={this.state.open}
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
                      dispatch(actions.setColumnVisibility(field, !isVisible))
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
      </>
    );
  }
}

ColumnVisibilityDropdown.propTypes = {
  columnsVisible: PropTypes.shape({}).isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect(({ lessonPlan }) => ({
  columnsVisible: lessonPlan.flags.editPageColumnsVisible,
}))(ColumnVisibilityDropdown);
