import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import Subheader from 'material-ui/Subheader';
import { Card, CardText } from 'material-ui/Card';
import { defaultComponentTitles } from 'course/translations.intl';
import { duplicableItemTypes } from 'course/duplication/constants';
import { categoryShape } from 'course/duplication/propTypes';
import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';
import IndentedCheckbox from 'course/duplication/components/IndentedCheckbox';

const { TAB, ASSESSMENT, CATEGORY } = duplicableItemTypes;

const translations = defineMessages({
  defaultCategory: {
    id: 'course.duplication.AssessmentsListing.defaultCategory',
    defaultMessage: 'Default Category',
  },
  defaultTab: {
    id: 'course.duplication.AssessmentsListing.defaultTab',
    defaultMessage: 'Default Tab',
  },
});

class AssessmentsListing extends React.Component {
  static propTypes = {
    categories: PropTypes.arrayOf(categoryShape),
    selectedItems: PropTypes.shape({}),
  }

  static renderAssessmentRow(assessment) {
    return (
      <IndentedCheckbox
        checked
        indentLevel={2}
        key={assessment.id}
        label={
          <span>
            <TypeBadge itemType={ASSESSMENT} />
            <UnpublishedIcon tooltipId="itemUnpublished" />
            {assessment.title}
          </span>
        }
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
        label={<span><TypeBadge itemType={TAB} />{tab.title}</span>}
      />
    );
  }

  static renderTabTree(tab, children) {
    return (
      <div key={tab ? tab.id : 'default'}>
        { tab ? AssessmentsListing.renderTabRow(tab) : AssessmentsListing.renderDefaultTabRow() }
        {
          children && (children.length > 0)
          && children.map(AssessmentsListing.renderAssessmentRow)
        }
      </div>
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

  static renderCategoryRow(category) {
    return (
      <IndentedCheckbox
        checked
        label={<span><TypeBadge itemType={CATEGORY} />{category.title}</span>}
      />
    );
  }

  static renderCategoryCard(category, orphanTabs, orphanAssessments) {
    const hasOrphanAssessments = orphanAssessments && orphanAssessments.length > 0;
    const hasOrphanTabs = orphanTabs && orphanTabs.length > 0;
    const categoryRow = category ?
      AssessmentsListing.renderCategoryRow(category) :
      AssessmentsListing.renderDefaultCategoryRow();
    const tabsTrees = tabs => tabs &&
      tabs.map(tab => AssessmentsListing.renderTabTree(tab, tab.assessments));

    return (
      <Card key={category ? category.id : 'default'}>
        <CardText>
          { categoryRow }
          { hasOrphanAssessments && AssessmentsListing.renderTabTree(null, orphanAssessments) }
          { hasOrphanTabs && tabsTrees(orphanTabs) }
          { category && tabsTrees(category.tabs) }
        </CardText>
      </Card>
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
          assessment => selectedItems[ASSESSMENT][assessment.id]
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
    const [categoriesTrees, tabTrees, assessmentTrees] = this.selectedSubtrees();
    const orphanTreesCount = tabTrees.length + assessmentTrees.length;
    const totalTreesCount = orphanTreesCount + categoriesTrees.length;
    if (totalTreesCount < 1) { return null; }

    return (
      <React.Fragment>
        <Subheader>
          <FormattedMessage {...defaultComponentTitles.course_assessments_component} />
        </Subheader>
        {
          categoriesTrees.map(category => (
            AssessmentsListing.renderCategoryCard(category, null, null)
          ))
        }
        { (orphanTreesCount > 0) && AssessmentsListing.renderCategoryCard(null, tabTrees, assessmentTrees) }
      </React.Fragment>
    );
  }
}

export default connect(({ duplication }) => ({
  categories: duplication.assessmentsComponent,
  selectedItems: duplication.selectedItems,
}))(AssessmentsListing);
