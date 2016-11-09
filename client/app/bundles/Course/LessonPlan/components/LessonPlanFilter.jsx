import React, { PropTypes } from 'react';
import Immutable from 'immutable';
import { DropdownButton, MenuItem, Glyphicon } from 'react-bootstrap';
import styles from './LessonPlanFilter.scss';

const propTypes = {
  lessonPlanItemTypeKey: PropTypes.func.isRequired,
  toggleItemTypeVisibility: PropTypes.func.isRequired,
  hiddenItemTypes: PropTypes.instanceOf(Immutable.List).isRequired,
  items: PropTypes.instanceOf(Immutable.List).isRequired,
};

class LessonPlanFilter extends React.Component {

  renderTypeMenuItem(itemType) {
    const { lessonPlanItemTypeKey, hiddenItemTypes } = this.props;
    const itemTypeKey = lessonPlanItemTypeKey(itemType);

    return (
      <MenuItem eventKey={itemTypeKey} key={itemTypeKey}>
        <Glyphicon glyph="ok" className={hiddenItemTypes.includes(itemTypeKey) ? styles.hidden : ''} />
        { ' ' }
        { itemType.join(': ') }
      </MenuItem>
    );
  }

  render() {
    const { toggleItemTypeVisibility, items } = this.props;
    const lessonPlanItemTypes = items.map(item => item.get('lesson_plan_item_type')).toSet().toList().sort();

    return (
      <div className={styles.filterContainer}>
        <DropdownButton
          id="lesson-plan-filter-dropdown-button"
          pullRight
          title="Filter"
          onSelect={itemType => toggleItemTypeVisibility(itemType)}
        >
          { lessonPlanItemTypes.map(type => this.renderTypeMenuItem(type)) }
        </DropdownButton>
      </div>
    );
  }
}

LessonPlanFilter.propTypes = propTypes;

export default LessonPlanFilter;
