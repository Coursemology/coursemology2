import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Card, CardContent, ListSubheader } from '@mui/material';
import PropTypes from 'prop-types';

import IndentedCheckbox from 'course/duplication/components/IndentedCheckbox';
import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';
import { duplicableItemTypes } from 'course/duplication/constants';
import { categoryShape } from 'course/duplication/propTypes';
import componentTranslations from 'course/translations';

const { TAB, ASSESSMENT, CATEGORY } = duplicableItemTypes;

const translations = defineMessages({
  defaultCategory: {
    id: 'course.duplication.Duplication.DuplicateItemsConfirmation.AssessmentsListing.defaultCategory',
    defaultMessage: 'Default Category',
  },
  defaultTab: {
    id: 'course.duplication.Duplication.DuplicateItemsConfirmation.AssessmentsListing.defaultTab',
    defaultMessage: 'Default Tab',
  },
});

class AssessmentsListing extends Component {
  static renderAssessmentRow(assessment) {
    return (
      <IndentedCheckbox
        key={`assessment_${assessment.id}`}
        checked
        indentLevel={2}
        label={
          <span style={{ display: 'flex', alignItems: 'centre' }}>
            <TypeBadge itemType={ASSESSMENT} />
            <UnpublishedIcon tooltipId="itemUnpublished" />
            {assessment.title}
          </span>
        }
      />
    );
  }

  static renderCategoryCard(category, orphanTabs, orphanAssessments) {
    const hasOrphanAssessments =
      orphanAssessments && orphanAssessments.length > 0;
    const hasOrphanTabs = orphanTabs && orphanTabs.length > 0;
    const categoryRow = category
      ? AssessmentsListing.renderCategoryRow(category)
      : AssessmentsListing.renderDefaultCategoryRow();
    const tabsTrees = (tabs) =>
      tabs &&
      tabs.map((tab) => AssessmentsListing.renderTabTree(tab, tab.assessments));

    return (
      <Card
        key={
          category
            ? `category_assessment_${category.id}`
            : 'category_assessment_default'
        }
      >
        <CardContent>
          {categoryRow}
          {hasOrphanAssessments &&
            AssessmentsListing.renderTabTree(null, orphanAssessments)}
          {hasOrphanTabs && tabsTrees(orphanTabs)}
          {category && tabsTrees(category.tabs)}
        </CardContent>
      </Card>
    );
  }

  static renderCategoryRow(category) {
    return (
      <IndentedCheckbox
        checked
        label={
          <span>
            <TypeBadge itemType={CATEGORY} />
            {category.title}
          </span>
        }
      />
    );
  }

  static renderDefaultCategoryRow() {
    return (
      <IndentedCheckbox
        disabled
        label={<FormattedMessage {...translations.defaultCategory} />}
      />
    );
  }

  static renderDefaultTabRow() {
    return (
      <IndentedCheckbox
        disabled
        indentLevel={1}
        label={<FormattedMessage {...translations.defaultTab} />}
      />
    );
  }

  static renderTabRow(tab) {
    return (
      <IndentedCheckbox
        checked
        indentLevel={1}
        label={
          <span>
            <TypeBadge itemType={TAB} />
            {tab.title}
          </span>
        }
      />
    );
  }

  static renderTabTree(tab, children) {
    return (
      <div key={tab ? `tab_assessment_${tab.id}` : 'tab_assessment_default'}>
        {tab
          ? AssessmentsListing.renderTabRow(tab)
          : AssessmentsListing.renderDefaultTabRow()}
        {children &&
          children.length > 0 &&
          children.map(AssessmentsListing.renderAssessmentRow)}
      </div>
    );
  }

  // Identifies connected subtrees of selected categories, tabs and assessments.
  selectedSubtrees() {
    const { categories, selectedItems } = this.props;
    const categoriesTrees = [];
    const tabTrees = [];
    const assessmentTrees = [];

    categories.forEach((category) => {
      const selectedTabs = [];
      category.tabs.forEach((tab) => {
        const selectedAssessments = tab.assessments.filter(
          (assessment) => selectedItems[ASSESSMENT][assessment.id],
        );

        if (selectedItems[TAB][tab.id]) {
          selectedTabs.push({ ...tab, assessments: selectedAssessments });
        } else {
          assessmentTrees.push(...selectedAssessments);
        }
      });

      if (selectedItems[CATEGORY][category.id]) {
        categoriesTrees.push({ ...category, tabs: selectedTabs });
      } else {
        tabTrees.push(...selectedTabs);
      }
    });

    return [categoriesTrees, tabTrees, assessmentTrees];
  }

  render() {
    const [categoriesTrees, tabTrees, assessmentTrees] =
      this.selectedSubtrees();
    const orphanTreesCount = tabTrees.length + assessmentTrees.length;
    const totalTreesCount = orphanTreesCount + categoriesTrees.length;
    if (totalTreesCount < 1) {
      return null;
    }

    return (
      <>
        <ListSubheader disableSticky>
          <FormattedMessage
            {...componentTranslations.course_assessments_component}
          />
        </ListSubheader>
        {categoriesTrees.map((category) =>
          AssessmentsListing.renderCategoryCard(category, null, null),
        )}
        {orphanTreesCount > 0 &&
          AssessmentsListing.renderCategoryCard(
            null,
            tabTrees,
            assessmentTrees,
          )}
      </>
    );
  }
}

AssessmentsListing.propTypes = {
  categories: PropTypes.arrayOf(categoryShape),
  selectedItems: PropTypes.shape({}),
};

export default connect(({ duplication }) => ({
  categories: duplication.assessmentsComponent,
  selectedItems: duplication.selectedItems,
}))(AssessmentsListing);
