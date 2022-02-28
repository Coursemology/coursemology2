import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@material-ui/core';
import { grey } from '@material-ui/core/colors';

import { defineMessages, FormattedMessage } from 'react-intl';
import { groupShape } from '../../propTypes';
import { sortByGroupRole, sortByName } from '../../utils/sort';
import GroupCard from '../../components/GroupCard';

const translations = defineMessages({
  subtitle: {
    id: 'course.group.show.groupTableCard.subtitle',
    defaultMessage:
      '{numMembers} {numMembers, plural, one {member} other {members}}',
  },
  serialNumber: {
    id: 'course.group.show.groupTableCard.serialNumber',
    defaultMessage: 'S/N',
  },
  name: {
    id: 'course.group.show.groupTableCard.name',
    defaultMessage: 'Name',
  },
  role: {
    id: 'course.group.show.groupTableCard.role',
    defaultMessage: 'Role',
  },
  noMembers: {
    id: 'course.group.show.groupTableCard.noMembers',
    defaultMessage:
      'This group has no members! Manage groups to assign members now!',
  },
});

const roles = {
  normal: 'Member',
  manager: 'Manager',
};

const styles = {
  empty: {
    paddingTop: '2rem',
    textAlign: 'center',
    color: grey[700],
  },
  rowHeight: {
    height: 36,
  },
};

const GroupTableCard = ({ group }) => {
  const members = [...group.members];
  members.sort(sortByName).sort(sortByGroupRole);

  return (
    <GroupCard
      title={group.name}
      subtitle={
        <FormattedMessage
          values={{ numMembers: members.length ?? 0 }}
          {...translations.subtitle}
        />
      }
    >
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
              <TableCell style={styles.rowHeight}>{m.name}</TableCell>
              <TableCell style={styles.rowHeight}>
                {roles[m.groupRole]}
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

GroupTableCard.propTypes = {
  group: groupShape.isRequired,
};

export default GroupTableCard;
