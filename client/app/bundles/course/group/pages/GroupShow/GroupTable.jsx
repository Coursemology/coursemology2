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
};

const GroupTable = ({ group }) => {
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
          <TableRow>
            <TableHeaderColumn>S/N</TableHeaderColumn>
            <TableHeaderColumn>Name</TableHeaderColumn>
            <TableHeaderColumn>Role</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
          {members.map((m, index) => (
            <TableRow key={m.id}>
              <TableRowColumn>{index + 1}</TableRowColumn>
              <TableRowColumn>{m.name}</TableRowColumn>
              <TableRowColumn>{roles[m.groupRole]}</TableRowColumn>
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

GroupTable.propTypes = {
  group: groupShape.isRequired,
};

export default GroupTable;
