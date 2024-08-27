import { FC, memo } from 'react';
import { ListItemText } from '@mui/material';
import equal from 'fast-deep-equal';
import {
  AssessmentProgrammingQuestionsData,
  AssessmentTabData,
} from 'types/course/admin/codaveri';

import Link from 'lib/components/core/Link';
import useItems from 'lib/hooks/items/useItems';
import { useAppSelector } from 'lib/hooks/store';

import { getAssessmentsForTab } from '../selectors';

import CodaveriToggleButtons from './buttons/CodaveriToggleButtons';
import CollapsibleList from './lists/CollapsibleList';
import AssessmentListItem from './AssessmentListItem';

interface AssessmentTabProps {
  tab: AssessmentTabData;
}

export const sortAssessments = (
  assessments: AssessmentProgrammingQuestionsData[],
): AssessmentProgrammingQuestionsData[] => {
  const sortedAssessments = [...assessments];
  sortedAssessments.sort((a, b) =>
    a.title.toLowerCase().trim() <= b.title.toLowerCase().trim() ? -1 : 1,
  );
  return sortedAssessments;
};

const AssessmentTab: FC<AssessmentTabProps> = (props) => {
  const { tab } = props;
  const assessments = useAppSelector((state) =>
    getAssessmentsForTab(state, tab.id),
  );
  const { processedItems: sortedAssessments } = useItems(
    assessments,
    [],
    sortAssessments,
  );
  const assessmentIds = assessments.map((item) => item.id);
  const assessmentWithProgrammingQns = assessments.filter(
    (assessment) => assessment.programmingQuestions.length > 0,
  );

  if (assessmentWithProgrammingQns.length === 0) return null;

  return (
    <CollapsibleList
      headerAction={<CodaveriToggleButtons assessmentIds={assessmentIds} />}
      headerTitle={
        <Link
          onClick={(e): void => e.stopPropagation()}
          opensInNewTab
          to={tab.url}
          underline="hover"
        >
          <ListItemText
            classes={{ primary: 'font-bold' }}
            primary={tab.title}
          />
        </Link>
      }
      level={1}
    >
      <>
        {sortedAssessments.map((assessment) => (
          <AssessmentListItem key={assessment.id} assessment={assessment} />
        ))}
      </>
    </CollapsibleList>
  );
};

export default memo(AssessmentTab, equal);
