import {
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
import GroupCard from '../../components/GroupCard';
import { groupShape } from '../../propTypes';
import { getSummaryOfModifications } from '../../utils/groups';

const styles = {
  groupTitle: {
    fontWeight: 'bold',
    marginTop: '1rem',
    fontSize: '2rem',
  },
  groupTitleMarginTop: {
    marginTop: '3rem',
  },
};

const roles = {
  normal: 'Normal',
  manager: 'Manager',
};

const SummaryTable = ({ groups, modifiedGroups }) => {
  // No point memoizing this since this changes every re-render
  const modifiedGroupSummaries = getSummaryOfModifications(
    groups,
    modifiedGroups,
  );

  if (modifiedGroupSummaries.length === 0) {
    return null;
  }

  return (
    <GroupCard
      title="Summary of Changes"
      subtitle={`${modifiedGroupSummaries.length} group${
        modifiedGroupSummaries.length === 1 ? '' : 's'
      } modified`}
    >
      {modifiedGroupSummaries.map((group, groupIndex) => (
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
                    {roles[m.groupRole === 'normal' ? 'manager' : 'normal']} to{' '}
                    {roles[m.groupRole]}
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
    </GroupCard>
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
