import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import Subheader from 'material-ui/Subheader';
import Checkbox from 'material-ui/Checkbox';
import Block from 'material-ui/svg-icons/content/block';
import { defaultComponentTitles } from 'course/translations.intl';
import { duplicableItemTypes } from 'course/duplication/constants';
import { setItemSelectedBoolean } from 'course/duplication/actions';
import { categoryShape } from 'course/duplication/propTypes';
import TypeBadge from 'course/duplication/components/TypeBadge';

const { TAB, ASSESSMENT, CATEGORY } = duplicableItemTypes;

const styles = {
  categoryCheckbox: {
    width: 'auto',
  },
  tabCheckbox: {
    marginLeft: 15,
    width: 'auto',
  },
  assessmentCheckbox: {
    marginLeft: 30,
  },
  checkboxLabel: {
    width: 'auto',
  },
  checkboxLine: {
    display: 'flex',
  },
  selectLink: {
    marginLeft: 20,
    lineHeight: '24px',
  },
  deselectLink: {
    marginLeft: 10,
    lineHeight: '24px',
  },
  unpublishedIcon: {
    width: '1em',
    height: '1em',
    marginRight: 3,
  },
};

const translations = defineMessages({
  selectAll: {
    id: 'course.duplication.AssessmentsSelector.selectAll',
    defaultMessage: 'Select All',
  },
  deselectAll: {
    id: 'course.duplication.AssessmentsSelector.deselectAll',
    defaultMessage: 'Deselect All',
  },
  noItems: {
    id: 'course.duplication.AssessmentsSelector.noItems',
    defaultMessage: 'There are no assessment items to duplicate.',
  },
});

class AssessmentsSelector extends React.Component {
  static propTypes = {
    categories: PropTypes.arrayOf(categoryShape),
    selectedItems: PropTypes.shape(),

    dispatch: PropTypes.func.isRequired,
  }

  static renderBulkSelectors(bulkSelectorMethod, item) {
    return (
      <div>
        <a
          onTouchTap={() => bulkSelectorMethod(item, true)}
          style={styles.selectLink}
        >
          <FormattedMessage {...translations.selectAll} />
        </a>
        <a
          onTouchTap={() => bulkSelectorMethod(item, false)}
          style={styles.deselectLink}
        >
          <FormattedMessage {...translations.deselectAll} />
        </a>
      </div>
    );
  }

  tabSetAll = (tab, value) => {
    const { dispatch } = this.props;
    dispatch(setItemSelectedBoolean(TAB, tab.id, value));
    tab.assessments.forEach((assessment) => {
      dispatch(setItemSelectedBoolean(ASSESSMENT, assessment.id, value));
    });
  }

  categorySetAll = (category, value) => {
    this.props.dispatch(setItemSelectedBoolean(CATEGORY, category.id, value));
    category.tabs.forEach(tab => this.tabSetAll(tab, value));
  }

  renderAssessmentTree(assessment) {
    const { dispatch, selectedItems } = this.props;
    const { id, title, published } = assessment;
    const checked = !!selectedItems[ASSESSMENT][id];
    const label = (
      <span>
        <TypeBadge itemType={ASSESSMENT} />
        { published || <Block style={styles.unpublishedIcon} /> }
        { title }
      </span>
    );

    return (
      <Checkbox
        key={id}
        label={label}
        checked={checked}
        style={styles.assessmentCheckbox}
        onCheck={(e, value) =>
          dispatch(setItemSelectedBoolean(ASSESSMENT, id, value))
        }
      />
    );
  }

  renderTabTree(tab) {
    const { dispatch, selectedItems } = this.props;
    const { id, title, assessments } = tab;
    const checked = !!selectedItems[TAB][id];

    return (
      <div key={id}>
        <div style={styles.checkboxLine}>
          <Checkbox
            checked={checked}
            label={<span><TypeBadge itemType={TAB} />{ title }</span>}
            style={styles.tabCheckbox}
            labelStyle={styles.checkboxLabel}
            onCheck={(e, value) =>
              dispatch(setItemSelectedBoolean(TAB, id, value))
            }
          />
          { AssessmentsSelector.renderBulkSelectors(this.tabSetAll, tab) }
        </div>
        { assessments.map(assessment => this.renderAssessmentTree(assessment)) }
      </div>
    );
  }

  renderCategoryTree(category) {
    const { dispatch, selectedItems } = this.props;
    const { id, title, tabs } = category;
    const checked = !!selectedItems[CATEGORY][id];

    return (
      <div key={id}>
        <div style={styles.checkboxLine}>
          <Checkbox
            checked={checked}
            label={<span><TypeBadge itemType={CATEGORY} />{ title }</span>}
            onCheck={(e, value) =>
              dispatch(setItemSelectedBoolean(CATEGORY, id, value))
            }
            style={styles.categoryCheckbox}
            labelStyle={styles.checkboxLabel}
          />
          { AssessmentsSelector.renderBulkSelectors(this.categorySetAll, category) }
        </div>
        { tabs.map(tab => this.renderTabTree(tab)) }
      </div>
    );
  }

  render() {
    const { categories } = this.props;
    if (!categories) { return null; }

    return (
      <div>
        <h2><FormattedMessage {...defaultComponentTitles.course_assessments_component} /></h2>
        {
          categories.length > 0 ?
          categories.map(category => this.renderCategoryTree(category)) :
          <Subheader>
            <FormattedMessage {...translations.noItems} />
          </Subheader>
        }
      </div>
    );
  }
}

export default connect(({ objectDuplication }) => ({
  categories: objectDuplication.assessmentsComponent,
  selectedItems: objectDuplication.selectedItems,
}))(AssessmentsSelector);
