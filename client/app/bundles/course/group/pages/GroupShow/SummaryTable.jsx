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
import { red100, blue100, green100 } from 'material-ui/styles/colors';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { groupShape } from '../../propTypes';
import { sortByGroupRole, sortByName } from '../../utils/sort';

const styles = {
  card: {
    marginBottom: '2rem',
  },
  title: {
    fontWeight: 'bold',
    marginTop: '0.5rem',
    marginBottom: 0,
  },
  groupTitle: {
    fontWeight: 'bold',
    marginTop: '1rem',
    fontSize: '2rem',
  },
  groupTitleMarginTop: {
    marginTop: '3rem',
  },
  text: {
    paddingTop: 0,
  },
};

const roles = {
  normal: 'Normal',
  manager: 'Manager',
};

const SummaryTable = ({ groups, modifiedGroups }) => {
  const groupMap = new Map();
  groups.forEach((g) => groupMap.set(g.id, g));

  const finalModifiedGroups = [];

  modifiedGroups.forEach((group) => {
    const groupData = {
      id: group.id,
      name: group.name,
      added: [],
      removed: [],
      updated: [],
    };
    const originalGroup = groupMap.get(group.id);
    if (!originalGroup) return; // Should not happen, but just in case
    const memberMap = new Map();
    originalGroup.members.forEach((m) => {
      memberMap.set(m.id, m);
    });
    group.members.forEach((m) => {
      if (!memberMap.has(m.id)) {
        groupData.added.push(m);
        return;
      }
      const originalMember = memberMap.get(m.id);
      if (m.groupRole !== originalMember.groupRole) {
        groupData.updated.push(m);
      }
    });
    const newMemberIds = new Set(group.members.map((m) => m.id));
    originalGroup.members.forEach((m) => {
      if (!newMemberIds.has(m.id)) {
        groupData.removed.push(m);
      }
    });

    groupData.added.sort(sortByName).sort(sortByGroupRole);
    groupData.removed.sort(sortByName).sort(sortByGroupRole);
    groupData.updated.sort(sortByName).sort(sortByGroupRole);

    if (
      groupData.added.length > 0 ||
      groupData.removed.length > 0 ||
      groupData.updated.length > 0
    ) {
      finalModifiedGroups.push(groupData);
    }
  });

  finalModifiedGroups.sort(sortByName);

  if (finalModifiedGroups.length === 0) {
    return null;
  }

  return (
    <Card style={styles.card}>
      <CardHeader
        title={<h3 style={styles.title}>Summary of Changes</h3>}
        subtitle={`${finalModifiedGroups.length} group${
          finalModifiedGroups.length === 1 ? '' : 's'
        } modified`}
      />
      <CardText style={styles.text}>
        {finalModifiedGroups.map((group, groupIndex) => (
          <>
            <h3
              style={{
                ...styles.groupTitle,
                ...(groupIndex > 0 ? styles.groupTitleMarginTop : {}),
              }}
            >
              {group.name}
            </h3>
            <Table selectable={false}>
              <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                <TableRow>
                  <TableHeaderColumn>S/N</TableHeaderColumn>
                  <TableHeaderColumn>Name</TableHeaderColumn>
                  <TableHeaderColumn>Role</TableHeaderColumn>
                  <TableHeaderColumn>Change</TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody displayRowCheckbox={false}>
                {group.added.map((m, index) => (
                  <TableRow key={m.id} style={{ backgroundColor: green100 }}>
                    <TableRowColumn>{index + 1}</TableRowColumn>
                    <TableRowColumn>{m.name}</TableRowColumn>
                    <TableRowColumn>{roles[m.groupRole]}</TableRowColumn>
                    <TableRowColumn>Added to group</TableRowColumn>
                  </TableRow>
                ))}
                {group.updated.map((m, index) => (
                  <TableRow key={m.id} style={{ backgroundColor: blue100 }}>
                    <TableRowColumn>
                      {index + 1 + group.added.length}
                    </TableRowColumn>
                    <TableRowColumn>{m.name}</TableRowColumn>
                    <TableRowColumn>{roles[m.groupRole]}</TableRowColumn>
                    <TableRowColumn>
                      Role switched from{' '}
                      {roles[m.groupRole === 'normal' ? 'manager' : 'normal']}{' '}
                      to {roles[m.groupRole]}
                    </TableRowColumn>
                  </TableRow>
                ))}
                {group.removed.map((m, index) => (
                  <TableRow key={m.id} style={{ backgroundColor: red100 }}>
                    <TableRowColumn>
                      {index + 1 + group.added.length + group.updated.length}
                    </TableRowColumn>
                    <TableRowColumn>{m.name}</TableRowColumn>
                    <TableRowColumn>{roles[m.groupRole]}</TableRowColumn>
                    <TableRowColumn>Removed from group</TableRowColumn>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        ))}
      </CardText>
    </Card>
  );
};

SummaryTable.propTypes = {
  groups: PropTypes.arrayOf(groupShape),
  modifiedGroups: PropTypes.arrayOf(groupShape),
};

export default connect((state) => ({
  groups: state.groupsFetch.groups,
  modifiedGroups: state.groupsManage.modifiedGroups,
}))(SummaryTable);
