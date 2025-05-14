import { FC, useMemo, useState } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import {
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { grey } from '@mui/material/colors';

import GhostIcon from 'lib/components/icons/GhostIcon';

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

const styles = {
  empty: {
    paddingTop: '2rem',
    textAlign: 'center' as const,
    color: grey[700],
  },
  rowHeight: {
    height: 36,
  },
  checkbox: {
    width: 'auto',
    padding: 0,
  },
};

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
              label: <FormattedMessage {...translations.manageOneGroup} />,
              onClick: onManageGroup,
            },
          ]
        : []),
    ],

    [onManageGroup, canManageCategory],
  );

  return (
    <GroupCard
      subtitle={
        <FormattedMessage
          values={{ numMembers, numManagers, numNormals }}
          {...translations.subtitle}
        />
      }
      title={group.name}
      titleButtons={titleButton}
    >
      {hasPhantomMembers && (
        <FormControlLabel
          control={
            <Checkbox
              checked={hidePhantomStudents}
              onChange={(_, checked) => setHidePhantomStudents(checked)}
            />
          }
          label={<FormattedMessage {...translations.hidePhantomStudents} />}
          style={styles.checkbox}
        />
      )}
      <Table>
        <TableHead>
          <TableRow style={styles.rowHeight}>
            <TableCell style={styles.rowHeight}>
              <FormattedMessage {...translations.serialNumber} />
            </TableCell>
            <TableCell style={styles.rowHeight}>
              <FormattedMessage {...translations.name} />
            </TableCell>
            <TableCell style={styles.rowHeight}>
              <FormattedMessage {...translations.role} />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {members.map((m, index) => (
            <TableRow key={m.id} style={styles.rowHeight}>
              <TableCell style={styles.rowHeight}>{index + 1}</TableCell>
              <TableCell style={styles.rowHeight}>
                <div className="flex grow items-center">
                  {m.name}
                  {m.isPhantom && <GhostIcon />}
                </div>
              </TableCell>
              <TableCell style={styles.rowHeight}>
                <GroupRoleChip user={m} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {members.length === 0 ? (
        <div style={styles.empty}>
          <FormattedMessage {...translations.noMembers} />
        </div>
      ) : null}
    </GroupCard>
  );
};

export default GroupTableCard;
