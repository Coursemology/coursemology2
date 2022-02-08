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

import { FormattedMessage } from 'react-intl';
import { groupShape } from '../../propTypes';
import translations from './translations.intl';
import { sortByGroupRole, sortByName } from '../../utils/sort';
import GroupCard from '../../components/GroupCard';

const roles = {
  normal: 'Normal',
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
          {...translations.groupHeaderSubtitle}
        />
      }
    >
      <Table selectable={false}>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow style={styles.rowHeight}>
            <TableHeaderColumn style={styles.rowHeight}>S/N</TableHeaderColumn>
            <TableHeaderColumn style={styles.rowHeight}>Name</TableHeaderColumn>
            <TableHeaderColumn style={styles.rowHeight}>Role</TableHeaderColumn>
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
              This group has no members! Manage groups to assign members now!
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
