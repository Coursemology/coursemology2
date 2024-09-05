import { FC } from 'react';
import { List, Typography } from '@mui/material';
import { AssessmentCategoryData } from 'types/course/admin/codaveri';

import Section from 'lib/components/core/layouts/Section';
import useItems from 'lib/hooks/items/useItems';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { getAllAssessmentCategories, getAllAssessments } from '../selectors';
import translations from '../translations';

import CodaveriToggleButtons from './buttons/CodaveriToggleButtons';
import ExpandAllSwitch from './buttons/ExpandAllSwitch';
import AssessmentCategory from './AssessmentCategory';

export const sortCategories = (
  categories: AssessmentCategoryData[],
): AssessmentCategoryData[] => {
  const sortedCategories = [...categories];
  sortedCategories.sort((a, b) => a.weight - b.weight);
  return sortedCategories;
};

interface Props {
  courseTitle: string;
}

const AssessmentList: FC<Props> = (props) => {
  const { courseTitle } = props;
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
        <div className="flex justify-between items-center">
          <div>
            <ExpandAllSwitch />
          </div>
          <div className="pr-28 space-x-48 flex justify-end">
            <Typography
              align="center"
              className="max-w-[10px] mr-2"
              variant="body2"
            >
              {t(translations.codaveriEvaluatorSettings)}
            </Typography>
            <div className="text-center">
              <Typography
                align="center"
                className="max-w-[10px] pr-24"
                variant="body2"
              >
                {t(translations.liveFeedbackSettings)}
              </Typography>
            </div>
          </div>
        </div>
        <div className="mb-4 pr-2 flex justify-end">
          <CodaveriToggleButtons
            assessmentIds={assessmentIds}
            for={courseTitle}
            type="course"
          />
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
