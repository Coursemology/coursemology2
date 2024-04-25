import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { ListSubheader, Typography } from '@mui/material';
import PropTypes from 'prop-types';

import BulkSelectors from 'course/duplication/components/BulkSelectors';
import IndentedCheckbox from 'course/duplication/components/IndentedCheckbox';
import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';
import { duplicableItemTypes } from 'course/duplication/constants';
import { categoryShape } from 'course/duplication/propTypes';
import destinationCourseSelector from 'course/duplication/selectors/destinationCourse';
import { actions } from 'course/duplication/store';
import { defaultComponentTitles } from 'course/translations.intl';

const { TAB, ASSESSMENT, CATEGORY } = duplicableItemTypes;

const translations = defineMessages({
  noItems: {
    id: 'course.duplication.Duplication.ItemsSelector.AssessmentsSelector.noItems',
    defaultMessage: 'There are no assessment items to duplicate.',
  },
});

class AssessmentsSelector extends Component {
  categorySetAll = (category) => (value) => {
    const { dispatch, categoryDisabled } = this.props;
    if (!categoryDisabled) {
      dispatch(actions.setItemSelectedBoolean(CATEGORY, category.id, value));
    }
    category.tabs.forEach((tab) => this.tabSetAll(tab)(value));
  };

  tabSetAll = (tab) => (value) => {
    const { dispatch, tabDisabled } = this.props;
    if (!tabDisabled) {
      dispatch(actions.setItemSelectedBoolean(TAB, tab.id, value));
    }
    tab.assessments.forEach((assessment) => {
      dispatch(
        actions.setItemSelectedBoolean(ASSESSMENT, assessment.id, value),
      );
    });
  };

  renderAssessmentTree(assessment) {
    const { dispatch, selectedItems } = this.props;
    const { id, title, published } = assessment;
    const checked = !!selectedItems[ASSESSMENT][id];
    const label = (
      <span style={{ display: 'flex', alignItems: 'centre' }}>
        <TypeBadge itemType={ASSESSMENT} />
        {published || <UnpublishedIcon />}
        {title}
      </span>
    );

    return (
      <IndentedCheckbox
        key={id}
        checked={checked}
        indentLevel={2}
        label={label}
        onChange={(e, value) =>
          dispatch(actions.setItemSelectedBoolean(ASSESSMENT, id, value))
        }
      />
    );
  }

  renderCategoryTree(category) {
    const { dispatch, selectedItems, categoryDisabled } = this.props;
    const { id, title, tabs } = category;
    const checked = !!selectedItems[CATEGORY][id];

    return (
      <div key={id}>
        <IndentedCheckbox
          checked={checked}
          disabled={categoryDisabled}
          label={
            <span>
              <TypeBadge itemType={CATEGORY} />
              {title}
            </span>
          }
          onChange={(e, value) =>
            dispatch(actions.setItemSelectedBoolean(CATEGORY, id, value))
          }
        >
          <BulkSelectors callback={this.categorySetAll(category)} />
        </IndentedCheckbox>
        {tabs.map((tab) => this.renderTabTree(tab))}
      </div>
    );
  }

  renderTabTree(tab) {
    const { dispatch, selectedItems, tabDisabled } = this.props;
    const { id, title, assessments } = tab;
    const checked = !!selectedItems[TAB][id];

    return (
      <div key={id}>
        <IndentedCheckbox
          checked={checked}
          disabled={tabDisabled}
          indentLevel={1}
          label={
            <span>
              <TypeBadge itemType={TAB} />
              {title}
            </span>
          }
          onChange={(e, value) =>
            dispatch(actions.setItemSelectedBoolean(TAB, id, value))
          }
        >
          <BulkSelectors callback={this.tabSetAll(tab)} />
        </IndentedCheckbox>
        {assessments.map((assessment) => this.renderAssessmentTree(assessment))}
      </div>
    );
  }

  render() {
    const { categories } = this.props;
    if (!categories) {
      return null;
    }

    return (
      <>
        <Typography className="mt-5 mb-5" variant="h2">
          <FormattedMessage
            {...defaultComponentTitles.course_assessments_component}
          />
        </Typography>
        {categories.length > 0 ? (
          categories.map((category) => this.renderCategoryTree(category))
        ) : (
          <ListSubheader disableSticky>
            <FormattedMessage {...translations.noItems} />
          </ListSubheader>
        )}
      </>
    );
  }
}

AssessmentsSelector.propTypes = {
  categories: PropTypes.arrayOf(categoryShape),
  selectedItems: PropTypes.shape({}),
  tabDisabled: PropTypes.bool,
  categoryDisabled: PropTypes.bool,

  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  const destinationCourse = destinationCourseSelector(state);
  const duplication = state.duplication;

  return {
    categories: duplication.assessmentsComponent,
    selectedItems: duplication.selectedItems,
    tabDisabled:
      duplication.sourceCourse.unduplicableObjectTypes.includes(TAB) ||
      destinationCourse.unduplicableObjectTypes.includes(TAB),
    categoryDisabled:
      duplication.sourceCourse.unduplicableObjectTypes.includes(CATEGORY) ||
      destinationCourse.unduplicableObjectTypes.includes(CATEGORY),
  };
};

export default connect(mapStateToProps)(AssessmentsSelector);
