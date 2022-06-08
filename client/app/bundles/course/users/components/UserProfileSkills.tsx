import { FC, Fragment } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import { SkillBranchEntity } from 'types/course/assessment/skills/skills';
import LinearProgressWithLabel from 'lib/components/LinearProgressWithLabel';

interface Props extends WrappedComponentProps {
  skillBranches: SkillBranchEntity[];
}

const translations = defineMessages({
  topicMasteryHeader: {
    id: 'course.users.show.topicMasteryHeader',
    defaultMessage: 'Topic Mastery',
  },
  gradeForSkill: {
    id: 'course.users.show.gradeForSkill',
    defaultMessage: '{grade}/{totalGrade} points',
  },
  noSkillBranches: {
    id: 'course.users.show.noSkillBranches',
    defaultMessage: 'No skill branches have been created... yet!',
  },
});

const UserProfileSkills: FC<Props> = ({ skillBranches, intl }: Props) => {
  const renderEmptyState = (): JSX.Element => {
    return (
      <Typography variant="body1">
        {intl.formatMessage(translations.noSkillBranches)}
      </Typography>
    );
  };

  return (
    <>
      <Typography variant="h4" component="h2">
        {intl.formatMessage(translations.topicMasteryHeader)}
      </Typography>
      <Table>
        <TableBody>
          {skillBranches.length > 0
            ? skillBranches.map((skillBranch) => (
                <Fragment key={`skill-branch-${skillBranch.id}`}>
                  <TableRow key={`skill-branch-title-${skillBranch.id}`}>
                    <TableCell colSpan={3}>
                      <Typography variant="body1">
                        <strong>{skillBranch.title}</strong>
                      </Typography>
                    </TableCell>
                  </TableRow>

                  {skillBranch.skills
                    ?.filter((skill) => skill.totalGrade > 0)
                    .map((skill) => (
                      <TableRow key={`skill-${skill.id}`}>
                        <TableCell style={{ textIndent: '30px', width: '25%' }}>
                          <Typography variant="body1">{skill.title}</Typography>
                        </TableCell>
                        <TableCell>
                          <LinearProgressWithLabel value={skill.percentage} />
                        </TableCell>
                        <TableCell style={{ width: '25%' }}>
                          <Typography variant="body1">
                            {intl.formatMessage(translations.gradeForSkill, {
                              grade: skill.grade,
                              totalGrade: skill.totalGrade,
                            })}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                </Fragment>
              ))
            : renderEmptyState()}
        </TableBody>
      </Table>
    </>
  );
};

export default injectIntl(UserProfileSkills);
