import { FC, memo, useState } from 'react';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import {
  Collapse,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import equal from 'fast-deep-equal';
import { AssessmentProgrammingQuestionsData } from 'types/course/admin/codaveri';

import AssessmentProgrammingQnList from './AssessmentProgrammingQnList';

interface AssessmentListItemProps {
  assessment: AssessmentProgrammingQuestionsData;
}

const AssessmentListItem: FC<AssessmentListItemProps> = (props) => {
  const { assessment } = props;
  const [isOpen, setIsOpen] = useState(true);

  if (assessment.programmingQuestions.length === 0) return null;

  return (
    <>
      <ListItemButton
        className="pl-0"
        onClick={(): void => setIsOpen((prevValue) => !prevValue)}
      >
        <ListItemIcon>{isOpen ? <ExpandLess /> : <ExpandMore />}</ListItemIcon>
        <ListItemText
          classes={{ primary: 'font-bold' }}
          primary={assessment.title}
        />
      </ListItemButton>
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <List dense disablePadding>
          {assessment.programmingQuestions.map((question) => (
            <AssessmentProgrammingQnList
              key={question.id}
              questionId={question.id}
            />
          ))}
        </List>
      </Collapse>
      <Divider className="border-neutral-300 last:border-none" />
    </>
  );
};

export default memo(AssessmentListItem, equal);
