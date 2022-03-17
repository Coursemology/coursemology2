import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@material-ui/core';
import { blue, green, red } from '@material-ui/core/colors';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import GroupCard from '../../../components/GroupCard';
import { groupShape } from '../../../propTypes';
import { getSummaryOfModifications } from '../../../utils/groups';

const translations = defineMessages({
  serialNumber: {
    id: 'course.group.show.changeSummary.serialNumber',
    defaultMessage: 'S/N',
  },
  name: {
    id: 'course.group.show.changeSummary.name',
    defaultMessage: 'Name',
  },
  role: {
    id: 'course.group.show.changeSummary.role',
    defaultMessage: 'Role',
  },
  change: {
    id: 'course.group.show.changeSummary.change',
    defaultMessage: 'Change',
  },
  add: {
    id: 'course.group.show.changeSummary.add',
    defaultMessage: 'Added to group',
  },
  switch: {
    id: 'course.group.show.changeSummary.switch',
    defaultMessage: 'Role switched from {oldRole} to {newRole}',
  },
  remove: {
    id: 'course.group.show.changeSummary.remove',
    defaultMessage: 'Removed from group',
  },
  title: {
    id: 'course.group.show.changeSummary.title',
    defaultMessage: 'Summary of Changes',
  },
  subtitle: {
    id: 'course.group.show.changeSummary.subtitle',
    defaultMessage:
      '{numGroups} {numGroups, plural, one {group} other {groups}} modified',
  },
});

const styles = {
  groupTitle: {
    fontWeight: 'bold',
    marginTop: '1rem',
    fontSize: '1.8rem',
  },
  groupTitleMarginTop: {
    marginTop: '3rem',
  },
  rowHeight: {
    height: 36,
  },
};

const roles = {
  normal: 'Member',
  manager: 'Manager',
};

const ChangeSummaryTable = ({ groups, modifiedGroups }) => {
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
      title={<FormattedMessage {...translations.title} />}
      subtitle={
        <FormattedMessage
          values={{ numGroups: modifiedGroupSummaries.length }}
          {...translations.subtitle}
        />
      }
    >
      {modifiedGroupSummaries.map((group, groupIndex) => (
        <div key={`group_${group.id}`}>
          <h3
            style={{
              ...styles.groupTitle,
              ...(groupIndex > 0 ? styles.groupTitleMarginTop : {}),
            }}
          >
            {group.name}
          </h3>
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
                <TableCell style={styles.rowHeight}>
                  <FormattedMessage {...translations.change} />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {group.added.map((m, index) => (
                <TableRow
                  key={m.id}
                  style={{ ...styles.rowHeight, backgroundColor: green[100] }}
                >
                  <TableCell style={styles.rowHeight}>{index + 1}</TableCell>
                  <TableCell style={styles.rowHeight}>{m.name}</TableCell>
                  <TableCell style={styles.rowHeight}>
                    {roles[m.groupRole]}
                  </TableCell>
                  <TableCell style={styles.rowHeight}>
                    <FormattedMessage {...translations.add} />
                  </TableCell>
                </TableRow>
              ))}
              {group.updated.map((m, index) => (
                <TableRow
                  key={m.id}
                  style={{ ...styles.rowHeight, backgroundColor: blue[100] }}
                >
                  <TableCell style={styles.rowHeight}>
                    {index + 1 + group.added.length}
                  </TableCell>
                  <TableCell style={styles.rowHeight}>{m.name}</TableCell>
                  <TableCell style={styles.rowHeight}>
                    {roles[m.groupRole]}
                  </TableCell>
                  <TableCell style={styles.rowHeight}>
                    <FormattedMessage
                      values={{
                        oldRole:
                          roles[
                            m.groupRole === 'normal' ? 'manager' : 'normal'
                          ],
                        newRole: roles[m.groupRole],
                      }}
                      {...translations.switch}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {group.removed.map((m, index) => (
                <TableRow
                  key={m.id}
                  style={{ ...styles.rowHeight, backgroundColor: red[100] }}
                >
                  <TableCell style={styles.rowHeight}>
                    {index + 1 + group.added.length + group.updated.length}
                  </TableCell>
                  <TableCell style={styles.rowHeight}>{m.name}</TableCell>
                  <TableCell style={styles.rowHeight}>
                    {roles[m.groupRole]}
                  </TableCell>
                  <TableCell style={styles.rowHeight}>
                    <FormattedMessage {...translations.remove} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </GroupCard>
  );
};

ChangeSummaryTable.propTypes = {
  groups: PropTypes.arrayOf(groupShape),
  modifiedGroups: PropTypes.arrayOf(groupShape),
};

export default connect((state) => ({
  groups: state.groupsFetch.groups,
  modifiedGroups: state.groupsManage.modifiedGroups,
}))(ChangeSummaryTable);
