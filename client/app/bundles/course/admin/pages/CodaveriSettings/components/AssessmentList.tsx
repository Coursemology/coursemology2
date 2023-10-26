import { FC } from 'react';
import { List } from '@mui/material';
import { AssessmentProgrammingQuestionsData } from 'types/course/admin/codaveri';

import Section from 'lib/components/core/layouts/Section';
import useItems from 'lib/hooks/items/useItems';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { getAllAssessments } from '../selectors';
import translations from '../translations';

import AssessmentListItem from './AssessmentListItem';
import CodaveriEnableDisableButtons from './CodaveriEnableDisableButtons';

export const sortAssessments = (
  assessments: AssessmentProgrammingQuestionsData[],
): AssessmentProgrammingQuestionsData[] => {
  const sortedAssessments = [...assessments];
  sortedAssessments.sort((a, b) =>
    a.title.toLowerCase().trim() <= b.title.toLowerCase().trim() ? -1 : 1,
  );
  return sortedAssessments;
};

const AssessmentList: FC = () => {
  const assessmentsWithProgrammingQuestion = useAppSelector((state) =>
    getAllAssessments(state),
  );
  const { processedItems: sortedAssessments } = useItems(
    assessmentsWithProgrammingQuestion,
    [],
    sortAssessments,
  );
  const { t } = useTranslation();
  return (
    <Section
      contentClassName="flex flex-col space-y-3"
      sticksToNavbar
      subtitle={t(translations.programmingQuestionSettingsSubtitle)}
      title={t(translations.programmingQuestionSettings)}
    >
      <section>
        <div className="mb-4 flex flex-row justify-end">
          <CodaveriEnableDisableButtons />
        </div>
        <div>
          <List
            className="p-0 w-full border border-solid border-neutral-300 rounded-lg"
            dense
          >
            {sortedAssessments.map((assessment) => (
              <AssessmentListItem key={assessment.id} assessment={assessment} />
            ))}
          </List>
        </div>
      </section>
    </Section>
  );
};

export default AssessmentList;
