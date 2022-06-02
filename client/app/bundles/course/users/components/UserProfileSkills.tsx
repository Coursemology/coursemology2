import { FC } from 'react';
import { Table, TableCell, TableRow, Typography } from '@mui/material';
import { SkillBranchEntity } from 'types/course/skill_branches';
import LinearProgressWithLabel from 'lib/components/LinearProgressWithLabel';

interface Props {
  skillBranches: SkillBranchEntity[];
}

const UserProfileSkills: FC<Props> = ({ skillBranches }: Props) => {
  return (
    <>
      <Typography variant="h4" component="h2">
        Topic Mastery
      </Typography>
      <Table>
        {skillBranches.map((skillBranch) => (
          <>
            <TableRow key={`skill-branch-${skillBranch.id}`}>
              <TableCell colSpan={3}>
                <Typography variant="body1">
                  <strong>{skillBranch.title}</strong>
                </Typography>
              </TableCell>
            </TableRow>

            {skillBranch.skills?.map((skill) => (
              <TableRow key={`skill-${skill.id}`}>
                <TableCell style={{ paddingLeft: '2em', width: '25%' }}>
                  <Typography variant="body1">{skill.title}</Typography>
                </TableCell>
                <TableCell>
                  <LinearProgressWithLabel value={skill.percentage} />
                </TableCell>
                <TableCell style={{ width: '25%' }}>
                  <Typography variant="body1">
                    {skill.grade}/{skill.totalGrade} points
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </>
        ))}
      </Table>
    </>
  );
};

export default UserProfileSkills;
