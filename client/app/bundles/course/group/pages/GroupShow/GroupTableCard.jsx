import React from 'react';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui';
import { grey700 } from 'material-ui/styles/colors';

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
    color: grey700,
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
      <Table selectable={false}>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow style={styles.rowHeight}>
            <TableHeaderColumn style={styles.rowHeight}>
              <FormattedMessage {...translations.serialNumber} />
            </TableHeaderColumn>
            <TableHeaderColumn style={styles.rowHeight}>
              <FormattedMessage {...translations.name} />
            </TableHeaderColumn>
            <TableHeaderColumn style={styles.rowHeight}>
              <FormattedMessage {...translations.role} />
            </TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
          {members.map((m, index) => (
            <TableRow key={m.id} style={styles.rowHeight}>
              <TableRowColumn style={styles.rowHeight}>
                {index + 1}
              </TableRowColumn>
              <TableRowColumn style={styles.rowHeight}>{m.name}</TableRowColumn>
              <TableRowColumn style={styles.rowHeight}>
                {roles[m.groupRole]}
              </TableRowColumn>
            </TableRow>
          ))}
          {members.length === 0 ? (
            <div style={styles.empty}>
              <FormattedMessage {...translations.noMembers} />
            </div>
          ) : null}
        </TableBody>
      </Table>
    </GroupCard>
  );
};

GroupTableCard.propTypes = {
  group: groupShape.isRequired,
};

export default GroupTableCard;
