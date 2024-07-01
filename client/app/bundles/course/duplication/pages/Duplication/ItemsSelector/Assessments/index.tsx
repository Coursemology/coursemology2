import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { ListSubheader, Typography } from '@mui/material';

import { duplicableItemTypes } from 'course/duplication/constants';
import destinationCourseSelector from 'course/duplication/selectors/destinationCourse';
import { selectDuplicationStore } from 'course/duplication/selectors/destinationInstance';
import { defaultComponentTitles } from 'course/translations.intl';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import CategoryTree from './CategoryTree';

const { TAB, CATEGORY } = duplicableItemTypes;

const translations = defineMessages({
  noItems: {
    id: 'course.duplication.Duplication.ItemsSelector.AssessmentsSelector.noItems',
    defaultMessage: 'There are no assessment items to duplicate.',
  },
});

const AssessmentsSelector: FC = () => {
  const { t } = useTranslation();
  const duplication = useAppSelector(selectDuplicationStore);

  const destinationCourse = useAppSelector(destinationCourseSelector);
  const {
    assessmentsComponent: categories,
    sourceCourse: { unduplicableObjectTypes },
  } = duplication;

  const tabDisabled =
    unduplicableObjectTypes.includes(TAB) ||
    destinationCourse.unduplicableObjectTypes.includes(TAB);

  const categoryDisabled =
    unduplicableObjectTypes.includes(CATEGORY) ||
    destinationCourse.unduplicableObjectTypes.includes(CATEGORY);

  if (!categories) {
    return null;
  }

  return (
    <>
      <Typography className="mt-3 mb-1" variant="h6">
        {t(defaultComponentTitles.course_assessments_component)}
      </Typography>
      {categories.length > 0 ? (
        categories.map((category) => (
          <CategoryTree
            key={category.id}
            category={category}
            categoryDisabled={categoryDisabled}
            tabDisabled={tabDisabled}
          />
        ))
      ) : (
        <ListSubheader disableSticky>{t(translations.noItems)}</ListSubheader>
      )}
    </>
  );
};

export default AssessmentsSelector;
