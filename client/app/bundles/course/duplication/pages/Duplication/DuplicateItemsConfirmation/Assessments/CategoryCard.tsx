import { FC } from 'react';
import { Card, CardContent } from '@mui/material';

import { Assessment, Category, Tab } from 'course/duplication/types';

import CategoryRow from './CategoryRow';
import TabsTrees from './TabsTrees';
import TabTree from './TabTree';

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

  return (
    <Card
      key={
        category
          ? `category_assessment_${category.id}`
          : 'category_assessment_default'
      }
    >
      <CardContent>
        <CategoryRow category={category} />
        {hasOrphanAssessments && <TabTree assessments={orphanAssessments} />}
        {hasOrphanTabs && <TabsTrees tabs={orphanTabs} />}
        {category && <TabsTrees tabs={category.tabs} />}
      </CardContent>
    </Card>
  );
};

export default CategoryCard;
