import { FC, memo } from 'react';
import { ListItemText } from '@mui/material';
import equal from 'fast-deep-equal';
import { AssessmentProgrammingQuestionsData } from 'types/course/admin/codaveri';

import Link from 'lib/components/core/Link';
import { useAppSelector } from 'lib/hooks/store';

import { getViewSettings } from '../selectors';

import CodaveriToggleButtons from './buttons/CodaveriToggleButtons';
import CollapsibleList from './lists/CollapsibleList';
import AssessmentHeaderChip from './AssessmentHeaderChip';
import AssessmentProgrammingQnList from './AssessmentProgrammingQnList';

interface AssessmentListItemProps {
  assessment: AssessmentProgrammingQuestionsData;
}

const AssessmentListItem: FC<AssessmentListItemProps> = (props) => {
  const { assessment } = props;
  const { isAssessmentListExpanded } = useAppSelector(getViewSettings);

  if (assessment.programmingQuestions.length === 0) return null;

  return (
    <CollapsibleList
      collapsedByDefault
      forceExpand={isAssessmentListExpanded}
      headerAction={<CodaveriToggleButtons assessmentIds={[assessment.id]} />}
      headerTitle={
        <>
          <Link
            onClick={(e): void => e.stopPropagation()}
            opensInNewTab
            to={assessment.url}
            underline="hover"
          >
            <ListItemText
              classes={{ primary: 'font-bold' }}
              primary={assessment.title}
            />
          </Link>
          <AssessmentHeaderChip assessmentIds={[assessment.id]} />
        </>
      }
      level={2}
    >
      <>
        {assessment.programmingQuestions.map((question) => (
          <AssessmentProgrammingQnList
            key={question.id}
            questionId={question.id}
          />
        ))}
      </>
    </CollapsibleList>
  );
};

export default memo(AssessmentListItem, equal);
