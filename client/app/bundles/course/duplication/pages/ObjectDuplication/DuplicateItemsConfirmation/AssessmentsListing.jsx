import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import Checkbox from 'material-ui/Checkbox';
import Subheader from 'material-ui/Subheader';
import { Card, CardText } from 'material-ui/Card';
import Block from 'material-ui/svg-icons/content/block';
import { defaultComponentTitles } from 'course/translations.intl';
import { duplicableItemTypes } from 'course/duplication/constants';
import { categoryShape } from 'course/duplication/propTypes';
import TypeBadge from 'course/duplication/components/TypeBadge';

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

const styles = {
  indent1: {
    marginLeft: 15,
  },
  indent2: {
    marginLeft: 30,
  },
  unpublishedIcon: {
    width: '1em',
    height: '1em',
    marginRight: 3,

    // Allow tooltip to be triggered
    zIndex: 3,
    position: 'relative',
  },
};

class AssessmentsListing extends React.Component {
  static propTypes = {
    categories: PropTypes.arrayOf(categoryShape),
    selectedItems: PropTypes.shape(),
  }

  static renderAssessmentRow(assessment) {
    return (
      <Checkbox
        checked
        key={assessment.id}
        label={
          <span>
            <TypeBadge itemType={ASSESSMENT} />
            <Block data-tip data-for="itemUnpublished" style={styles.unpublishedIcon} />
            {assessment.title}
          </span>
        }
        style={styles.indent2}
      />
    );
  }

  static renderDefaultTabRow() {
    return (
      <Checkbox
        disabled
        label={<FormattedMessage {...translations.defaultTab} />}
        style={styles.indent1}
      />
    );
  }

  static renderTabRow(tab) {
    return (
      <Checkbox
        checked
        label={<span><TypeBadge itemType={TAB} />{tab.title}</span>}
        style={styles.indent1}
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
      <Checkbox
        disabled
        label={<FormattedMessage {...translations.defaultCategory} />}
      />
    );
  }

  static renderCategoryRow(category) {
    return (
      <Checkbox
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

  /**
  * Organises selected assessment component items into trees and returns a list of Cards - one for each tree
  * with a category at its root. This should mirror what the backend does - items come under their parents
  * only if their parents have been duplicated, otherwise, they are placed under a default parent.
  */
  renderCards() {
    const { categories, selectedItems } = this.props;
    const categoriesTrees = [];
    const tabTrees = [];
    const assessmentTrees = [];

    // Identify connected sub-trees and push them into categoriesTrees, tabTrees, assessmentTrees
    // depending on the type of item at the root of the connected sub-tree.
    categories.forEach((category) => {
      const selectedTabs = [];
      category.tabs.forEach((tab) => {
        const selectedAssessments = tab.assessments.filter(assessment =>
          selectedItems[ASSESSMENT][assessment.id]
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

    const hasOrphanedItems = (tabTrees.length > 0) || (assessmentTrees.length > 0);
    return (
      <div>
        {
          categoriesTrees.map(category => (
            AssessmentsListing.renderCategoryCard(category, null, null))
          )
        }
        { hasOrphanedItems && AssessmentsListing.renderCategoryCard(null, tabTrees, assessmentTrees) }
      </div>
    );
  }

  render() {
    return (
      <div>
        <Subheader>
          <FormattedMessage {...defaultComponentTitles.course_assessments_component} />
        </Subheader>
        { this.renderCards() }
      </div>
    );
  }
}

export default connect(({ objectDuplication }) => ({
  categories: objectDuplication.assessmentsComponent,
  selectedItems: objectDuplication.selectedItems,
}))(AssessmentsListing);
