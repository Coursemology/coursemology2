import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import Subheader from 'material-ui/Subheader';
import { defaultComponentTitles } from 'course/translations.intl';
import { duplicableItemTypes } from 'course/duplication/constants';
import { setItemSelectedBoolean } from 'course/duplication/actions';
import { categoryShape } from 'course/duplication/propTypes';
import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';
import IndentedCheckbox from 'course/duplication/components/IndentedCheckbox';
import BulkSelectors from 'course/duplication/components/BulkSelectors';
import destinationCourseSelector from 'course/duplication/selectors/destinationCourse';

const { TAB, ASSESSMENT, CATEGORY } = duplicableItemTypes;

const translations = defineMessages({
  noItems: {
    id: 'course.duplication.AssessmentsSelector.noItems',
    defaultMessage: 'There are no assessment items to duplicate.',
  },
});

class AssessmentsSelector extends Component {
  tabSetAll = (tab) => (value) => {
    const { dispatch, tabDisabled } = this.props;
    if (!tabDisabled) {
      dispatch(setItemSelectedBoolean(TAB, tab.id, value));
    }
    tab.assessments.forEach((assessment) => {
      dispatch(setItemSelectedBoolean(ASSESSMENT, assessment.id, value));
    });
  };

  categorySetAll = (category) => (value) => {
    const { dispatch, categoryDisabled } = this.props;
    if (!categoryDisabled) {
      dispatch(setItemSelectedBoolean(CATEGORY, category.id, value));
    }
    category.tabs.forEach((tab) => this.tabSetAll(tab)(value));
  };

  renderAssessmentTree(assessment) {
    const { dispatch, selectedItems } = this.props;
    const { id, title, published } = assessment;
    const checked = !!selectedItems[ASSESSMENT][id];
    const label = (
      <span>
        <TypeBadge itemType={ASSESSMENT} />
        {published || <UnpublishedIcon />}
        {title}
      </span>
    );

    return (
      <IndentedCheckbox
        key={id}
        label={label}
        checked={checked}
        indentLevel={2}
        onCheck={(e, value) =>
          dispatch(setItemSelectedBoolean(ASSESSMENT, id, value))
        }
      />
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
          onCheck={(e, value) =>
            dispatch(setItemSelectedBoolean(TAB, id, value))
          }
        >
          <BulkSelectors callback={this.tabSetAll(tab)} />
        </IndentedCheckbox>
        {assessments.map((assessment) => this.renderAssessmentTree(assessment))}
      </div>
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
          onCheck={(e, value) =>
            dispatch(setItemSelectedBoolean(CATEGORY, id, value))
          }
        >
          <BulkSelectors callback={this.categorySetAll(category)} />
        </IndentedCheckbox>
        {tabs.map((tab) => this.renderTabTree(tab))}
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
        <h2>
          <FormattedMessage
            {...defaultComponentTitles.course_assessments_component}
          />
        </h2>
        {categories.length > 0 ? (
          categories.map((category) => this.renderCategoryTree(category))
        ) : (
          <Subheader>
            <FormattedMessage {...translations.noItems} />
          </Subheader>
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
