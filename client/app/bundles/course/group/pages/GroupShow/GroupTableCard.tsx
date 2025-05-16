import { FC, useMemo, useState } from 'react';
import { defineMessages } from 'react-intl';
import {
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';

import GhostIcon from 'lib/components/icons/GhostIcon';
import useTranslation from 'lib/hooks/useTranslation';

import GroupCard from '../../components/GroupCard';
import GroupRoleChip from '../../components/GroupRoleChip';
import { Group } from '../../types';
import { sortByGroupRole, sortByName, sortByPhantom } from '../../utils/sort';

const translations = defineMessages({
  subtitle: {
    id: 'course.group.GroupShow.GroupTableCard.subtitle',
    defaultMessage:
      '{numMembers} total (' +
      '{numManagers} {numManagers, plural, one {manager} other {managers}}, ' +
      '{numNormals} {numNormals, plural, one {member} other {members}})',
  },
  serialNumber: {
    id: 'course.group.GroupShow.GroupTableCard.serialNumber',
    defaultMessage: 'S/N',
  },
  name: {
    id: 'course.group.GroupShow.GroupTableCard.name',
    defaultMessage: 'Name',
  },
  role: {
    id: 'course.group.GroupShow.GroupTableCard.role',
    defaultMessage: 'Role',
  },
  noMembers: {
    id: 'course.group.GroupShow.GroupTableCard.noMembers',
    defaultMessage:
      'This group has no members! Manage groups to assign members now!',
  },
  manageOneGroup: {
    id: 'course.group.GroupShow.GroupTableCard.manageOneGroup',
    defaultMessage: 'Edit Group',
  },
  hidePhantomStudents: {
    id: 'course.group.GroupShow.GroupTableCard.hidePhantomStudents',
    defaultMessage: 'Hide all phantom students',
  },
});

interface GroupTableCardProps {
  group: Group;
  onManageGroup: () => void;
  canManageCategory: boolean;
}

const GroupTableCard: FC<GroupTableCardProps> = ({
  group,
  onManageGroup,
  canManageCategory,
}) => {
  const [hidePhantomStudents, setHidePhantomStudents] = useState(true);
  const { t } = useTranslation();

  const allMembers = [...group.members];
  allMembers.sort(sortByName).sort(sortByPhantom).sort(sortByGroupRole);
  const membersWithoutPhantom = allMembers.filter((m) => !m.isPhantom);
  const hasPhantomMembers = allMembers.length !== membersWithoutPhantom.length;
  const members = hidePhantomStudents ? membersWithoutPhantom : allMembers;

  const numMembers = members.length ?? 0;
  const numManagers =
    members.filter((m) => m.groupRole === 'manager').length ?? 0;
  const numNormals =
    members.filter((m) => m.groupRole === 'normal').length ?? 0;

  const titleButton = useMemo(
    () => [
      ...(canManageCategory
        ? [
            {
              label: t(translations.manageOneGroup),
              onClick: onManageGroup,
            },
          ]
        : []),
    ],

    [onManageGroup, canManageCategory, t],
  );

  return (
    <GroupCard
      subtitle={t(translations.subtitle, {
        numMembers,
        numManagers,
        numNormals,
      })}
      title={group.name}
      titleButtons={titleButton}
    >
      {hasPhantomMembers && (
        <FormControlLabel
          className="w-auto p-0"
          control={
            <Checkbox
              checked={hidePhantomStudents}
              onChange={(_, checked) => setHidePhantomStudents(checked)}
            />
          }
          label={t(translations.hidePhantomStudents)}
        />
      )}
      <Table>
        <TableHead>
          <TableRow className="h-9">
            <TableCell className="h-9">
              {t(translations.serialNumber)}
            </TableCell>
            <TableCell className="h-9">{t(translations.name)}</TableCell>
            <TableCell className="h-9">{t(translations.role)}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {members.map((m, index) => (
            <TableRow key={m.id} className="h-9">
              <TableCell className="h-9">{index + 1}</TableCell>
              <TableCell className="h-9">
                <div className="flex grow items-center">
                  {m.name}
                  {m.isPhantom && <GhostIcon />}
                </div>
              </TableCell>
              <TableCell className="h-9">
                <GroupRoleChip user={m} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {members.length === 0 ? (
        <div className="pt-8 text-center text-gray-700">
          {t(translations.noMembers)}
        </div>
      ) : null}
    </GroupCard>
  );
};

export default GroupTableCard;
