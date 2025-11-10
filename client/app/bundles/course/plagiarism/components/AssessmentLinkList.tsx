import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { OpenInNew } from '@mui/icons-material';
import {
  Checkbox,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Tooltip,
} from '@mui/material';
import { LinkedAssessment } from 'types/course/plagiarism';

import Link from 'lib/components/core/Link';
import useTranslation from 'lib/hooks/useTranslation';

interface Props {
  assessmentId: number;
  assessmentsByCourse: Record<number, LinkedAssessment[]>;
  onCheck: (assessment: LinkedAssessment) => void;
  colourMap: Record<number, string>;
  isChecked?: boolean;
}

const translations = defineMessages({
  noAssessmentsFound: {
    id: 'course.plagiarism.PlagiarismIndex.assessments.AssessmentLinkList.noAssessmentsFound',
    defaultMessage: 'No assessments found',
  },
  cannotManage: {
    id: 'course.plagiarism.PlagiarismIndex.assessments.AssessmentLinkList.cannotManage',
    defaultMessage: 'You do not have permission to manage this assessment.',
  },
});

const AssessmentLinkList: FC<Props> = (props) => {
  const { t } = useTranslation();

  const {
    assessmentId,
    assessmentsByCourse,
    onCheck,
    colourMap = {},
    isChecked,
  } = props;

  const courseIds = Object.keys(assessmentsByCourse).map(Number);

  const renderAssessmentsListItems = (
    courseId: number,
    assessments: LinkedAssessment[],
  ): JSX.Element => {
    const courseTitle = assessments[0]?.courseTitle || '';
    return (
      <li key={courseId}>
        <ul className="list-none p-0 m-0">
          <ListSubheader className="bg-neutral-100 font-bold leading-none py-4 px-3">
            {courseTitle}
          </ListSubheader>
          {assessments.map((assessment) => {
            return (
              <ListItem
                key={assessment.id}
                disablePadding
                secondaryAction={
                  assessment.canManage ? (
                    <IconButton
                      component={Link}
                      edge="end"
                      href={assessment.url}
                      target="_blank"
                    >
                      <OpenInNew color="primary" />
                    </IconButton>
                  ) : (
                    <Tooltip title={t(translations.cannotManage)}>
                      <span>
                        <IconButton
                          component={Link}
                          edge="end"
                          href={assessment.url}
                          target="_blank"
                        >
                          <OpenInNew color="disabled" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  )
                }
              >
                <ListItemButton
                  key={assessment.id}
                  className={colourMap[assessment.id]}
                  dense
                  disabled={
                    assessment.id === assessmentId || !assessment.canManage
                  }
                  onClick={() => onCheck(assessment)}
                >
                  <Checkbox
                    checked={isChecked}
                    className="px-2 py-1"
                    disableRipple
                    edge="start"
                    tabIndex={-1}
                  />
                  <ListItemText primary={assessment.title} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </ul>
      </li>
    );
  };

  return (
    <List className="border border-solid border-neutral-300 flex-1 overflow-y-auto p-0">
      {courseIds.length === 0 && (
        <ListItemButton className="text-neutral-400">
          <ListItemText>{t(translations.noAssessmentsFound)}</ListItemText>
        </ListItemButton>
      )}
      {courseIds.map((courseId) =>
        renderAssessmentsListItems(courseId, assessmentsByCourse[courseId]),
      )}
    </List>
  );
};

export default AssessmentLinkList;
