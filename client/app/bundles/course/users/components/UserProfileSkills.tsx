import React, { FC } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
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
        <TableBody>
          {skillBranches.map((skillBranch) => (
            <React.Fragment key={`skill-branch-${skillBranch.id}`}>
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
                        {skill.grade}/{skill.totalGrade} points
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default UserProfileSkills;
