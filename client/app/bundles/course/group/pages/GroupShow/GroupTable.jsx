import React from 'react';
import {
  Card,
  CardHeader,
  CardText,
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

const roles = {
  normal: 'Normal',
  manager: 'Manager',
};

const styles = {
  card: {
    marginBottom: '2rem',
  },
  title: {
    fontWeight: 'bold',
    marginTop: '0.5rem',
    marginBottom: 0,
  },
  cardText: {
    paddingTop: 0,
  },
  empty: {
    paddingTop: '2rem',
    textAlign: 'center',
    color: grey700,
  },
};

const GroupTable = ({ group }) => (
  <Card style={styles.card}>
    <CardHeader
      title={<h3 style={styles.title}>{group.name}</h3>}
      subtitle={
        <FormattedMessage
          values={{ numMembers: group.members?.length ?? 0 }}
          {...translations.groupHeaderSubtitle}
        />
      }
    />
    <CardText style={styles.cardText}>
      <Table selectable={false}>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn>S/N</TableHeaderColumn>
            <TableHeaderColumn>Name</TableHeaderColumn>
            <TableHeaderColumn>Role</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
          {group.members.map((m, index) => (
            <TableRow key={m.id}>
              <TableRowColumn>{index + 1}</TableRowColumn>
              <TableRowColumn>{m.name}</TableRowColumn>
              <TableRowColumn>{roles[m.groupRole]}</TableRowColumn>
            </TableRow>
          ))}
          {group.members.length === 0 ? (
            <div style={styles.empty}>
              This group has no members! Manage groups to assign members now!
            </div>
          ) : null}
        </TableBody>
      </Table>
    </CardText>
  </Card>
);

GroupTable.propTypes = {
  group: groupShape.isRequired,
};

export default GroupTable;
