import { FC } from 'react';
import { List } from '@mui/material';
import { AssessmentCategoryData } from 'types/course/admin/codaveri';

import Section from 'lib/components/core/layouts/Section';
import useItems from 'lib/hooks/items/useItems';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { getAllAssessmentCategories, getAllAssessments } from '../selectors';
import translations from '../translations';

import CodaveriEnableDisableButtons from './buttons/CodaveriEnableDisableButtons';
import ExpandAllSwitch from './buttons/ExpandAllSwitch';
import ShowCodaveriOnlySwitch from './buttons/ShowCodaveriOnlySwitch';
import AssessmentCategory from './AssessmentCategory';

export const sortCategories = (
  categories: AssessmentCategoryData[],
): AssessmentCategoryData[] => {
  const sortedCategories = [...categories];
  sortedCategories.sort((a, b) => a.weight - b.weight);
  return sortedCategories;
};

const AssessmentList: FC = () => {
  const assessmentCategories = useAppSelector((state) =>
    getAllAssessmentCategories(state),
  );
  const assessments = useAppSelector((state) => getAllAssessments(state));
  const { processedItems: sortedCategories } = useItems(
    assessmentCategories,
    [],
    sortCategories,
  );
  const { t } = useTranslation();
  const assessmentIds = assessments.map((item) => item.id);
  return (
    <Section
      contentClassName="flex flex-col space-y-3"
      sticksToNavbar
      subtitle={t(translations.programmingQuestionSettingsSubtitle)}
      title={t(translations.programmingQuestionSettings)}
    >
      <section>
        <div className="mb-4 flex justify-between items-center">
          <div>
            <ExpandAllSwitch />
            <ShowCodaveriOnlySwitch />
          </div>
          <CodaveriEnableDisableButtons assessmentIds={assessmentIds} />
        </div>
        <div>
          <List
            className="p-0 w-full border border-solid border-neutral-300 rounded-lg"
            dense
          >
            {sortedCategories.map((category) => (
              <AssessmentCategory key={category.id} category={category} />
            ))}
          </List>
        </div>
      </section>
    </Section>
  );
};

export default AssessmentList;
