import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import Done from '@mui/icons-material/Done';
import KeyboardArrowUp from '@mui/icons-material/KeyboardArrowUp';
import { Button, MenuItem, MenuList, Popover } from '@mui/material';
import PropTypes from 'prop-types';

import { actions } from '../../store';
import TranslatedItemType from '../TranslatedItemType';

const translations = defineMessages({
  filter: {
    id: 'course.lessonPlan.LessonPlanFilter.filter',
    defaultMessage: 'Filter',
  },
});

class LessonPlanFilter extends Component {
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
    const { dispatch, visibility } = this.props;
    const itemTypes = Object.keys(visibility);

    if (itemTypes.length < 1) {
      return null;
    }

    return (
      <>
        <Button
          color="secondary"
          endIcon={<KeyboardArrowUp />}
          onClick={this.handleClick}
          variant="contained"
        >
          <FormattedMessage {...translations.filter} />
        </Button>
        <Popover
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
          onClose={this.handleRequestClose}
          open={this.state.open}
          transformOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuList>
            {itemTypes.map((itemType) => {
              const isVisible = visibility[itemType];
              return (
                <MenuItem
                  key={itemType}
                  onClick={() =>
                    dispatch(
                      actions.setItemTypeVisibility(itemType, !isVisible),
                    )
                  }
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  <TranslatedItemType type={itemType} />
                  {isVisible && <Done />}
                </MenuItem>
              );
            })}
          </MenuList>
        </Popover>
      </>
    );
  }
}

LessonPlanFilter.propTypes = {
  visibility: PropTypes.shape({}).isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect(({ lessonPlan }) => ({
  visibility: lessonPlan.lessonPlan.visibilityByType,
}))(LessonPlanFilter);
