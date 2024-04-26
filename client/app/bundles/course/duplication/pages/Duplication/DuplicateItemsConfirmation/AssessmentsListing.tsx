import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Card, CardContent, ListSubheader, Typography } from '@mui/material';

import IndentedCheckbox from 'course/duplication/components/IndentedCheckbox';
import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';
import { duplicableItemTypes } from 'course/duplication/constants';
import { selectDuplicationStore } from 'course/duplication/selectors/destinationInstance';
import { Assessment, Category, Tab } from 'course/duplication/types';
import { defaultComponentTitles } from 'course/translations.intl';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

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

interface AssessmentRowProps {
  assessment: Assessment;
}

const AssessmentRow: FC<AssessmentRowProps> = (props) => {
  const { assessment } = props;

  return (
    <IndentedCheckbox
      key={`assessment_${assessment.id}`}
      checked
      indentLevel={2}
      label={
        <span className="flex flex-row items-center">
          <TypeBadge itemType={ASSESSMENT} />
          <UnpublishedIcon tooltipId="itemUnpublished" />
          <Typography className="font-bold">{assessment.title}</Typography>
        </span>
      }
    />
  );
};

interface CategoryRowProps {
  category: Category;
}

const CategoryRow: FC<CategoryRowProps> = (props) => {
  const { category } = props;

  return (
    <IndentedCheckbox
      checked
      indentLevel={0}
      label={
        <span className="flex flex-row items-center">
          <TypeBadge itemType={CATEGORY} />
          <Typography className="font-bold">{category.title}</Typography>
        </span>
      }
    />
  );
};

const DefaultCategoryRow: FC = () => {
  const { t } = useTranslation();

  return (
    <IndentedCheckbox
      disabled
      indentLevel={0}
      label={
        <Typography className="font-bold">
          {t(translations.defaultCategory)}
        </Typography>
      }
    />
  );
};

interface TabRowProps {
  tab: Tab;
}

const TabRow: FC<TabRowProps> = (props) => {
  const { tab } = props;

  return (
    <IndentedCheckbox
      checked
      indentLevel={1}
      label={
        <span className="flex flex-row items-center">
          <TypeBadge itemType={TAB} />
          <Typography className="font-bold">{tab.title}</Typography>
        </span>
      }
    />
  );
};

const DefaultTabRow: FC = () => {
  const { t } = useTranslation();

  return (
    <IndentedCheckbox
      disabled
      indentLevel={0}
      label={
        <Typography className="font-bold">
          {t(translations.defaultTab)}
        </Typography>
      }
    />
  );
};

interface TabTreeProps {
  tab?: Tab;
  assessments: Assessment[];
}

const TabTree: FC<TabTreeProps> = (props) => {
  const { tab, assessments } = props;

  return (
    <div key={tab ? `tab_assessment_${tab.id}` : 'tab_assessment_default'}>
      {tab ? <TabRow tab={tab} /> : <DefaultTabRow />}
      {assessments &&
        assessments.length > 0 &&
        assessments.map((assessment) => (
          <AssessmentRow key={assessment.id} assessment={assessment} />
        ))}
    </div>
  );
};

const selectedSubtrees: (
  categories: Category[],
  selectedItems: Record<string, Record<number, boolean>>,
) => [Category[], Tab[], Assessment[]] = (categories, selectedItems) => {
  const categoriesTrees: Category[] = [];
  const tabTrees: Tab[] = [];
  const assessmentTrees: Assessment[] = [];

  categories.forEach((category) => {
    const selectedTabs: Tab[] = [];
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
};

interface TabTreesProps {
  tabs: Tab[];
}

const TabsTrees: FC<TabTreesProps> = (props) => {
  const { tabs } = props;
  if (tabs.length < 1) {
    return null;
  }

  return (
    <div>
      {tabs.map((tab) => (
        <TabTree key={tab.id} assessments={tab.assessments} tab={tab} />
      ))}
    </div>
  );
};

interface CategoryCardProps {
  category?: Category;
  orphanTabs?: Tab[];
  orphanAssessments?: Assessment[];
}

const CategoryCard: FC<CategoryCardProps> = (props) => {
  const { category, orphanTabs, orphanAssessments } = props;

  const hasOrphanAssessments =
    orphanAssessments && orphanAssessments.length > 0;
  const hasOrphanTabs = orphanTabs && orphanTabs.length > 0;
  const categoryRow = category ? (
    <CategoryRow category={category} />
  ) : (
    <DefaultCategoryRow />
  );

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
        {hasOrphanAssessments && <TabTree assessments={orphanAssessments} />}
        {hasOrphanTabs && <TabsTrees tabs={orphanTabs} />}
        {category && <TabsTrees tabs={category.tabs} />}
      </CardContent>
    </Card>
  );
};

const AssessmentsListing: FC = () => {
  const { t } = useTranslation();

  const duplication = useAppSelector(selectDuplicationStore);
  const { assessmentsComponent: categories, selectedItems } = duplication;

  const [categoriesTrees, tabTrees, assessmentTrees] = selectedSubtrees(
    categories,
    selectedItems,
  );

  const orphanTreesCount = tabTrees.length + assessmentTrees.length;
  const totalTreesCount = orphanTreesCount + categoriesTrees.length;
  if (totalTreesCount < 1) {
    return null;
  }

  return (
    <>
      <ListSubheader disableSticky>
        {t(defaultComponentTitles.course_assessments_component)}
      </ListSubheader>
      {categoriesTrees.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
      {orphanTreesCount > 0 && (
        <CategoryCard
          orphanAssessments={assessmentTrees}
          orphanTabs={tabTrees}
        />
      )}
    </>
  );
};

export default AssessmentsListing;
