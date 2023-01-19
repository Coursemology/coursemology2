import { useMemo, useState } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Checkbox, 
  FormControlLabel,  
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow } from '@mui/material';
import { grey } from '@mui/material/colors';
import ghostIcon from 'assets/icons/ghost.svg?url';
import PropTypes from 'prop-types';

import GroupCard from '../../components/GroupCard';
import { groupShape } from '../../propTypes';
import { sortByGroupRole, sortByName, sortByPhantom } from '../../utils/sort';

const translations = defineMessages({
  subtitle: {
    id: 'course.group.GroupShow.GroupTableCard.subtitle',
    defaultMessage:
      '{numMembers} {numMembers, plural, one {member} other {members}}',
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
    id: 'course.group.GroupShow.CategoryCard.manageOne',
    defaultMessage: 'Edit Group',
  },
  hidePhantomStudents: {
    id: 'course.group.GroupShow.GroupTableCard.hidePhantomStudents',
    defaultMessage:
      'Hide all phantom students',
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

const GroupTableCard = ({ group, onManageGroups, canManageCategory }) => {
  const [hidePhantomStudents, setHidePhantomStudents] = useState(false);

  let members = [...group.members];
  if (hidePhantomStudents) {
    members = members.filter((m) => !m.isPhantom)
  }

  members.sort(sortByName).sort(sortByPhantom).sort(sortByGroupRole);

  const titleButton = useMemo(() => {
    const result = [];
    if (canManageCategory) {
      result.push({
        label: <FormattedMessage {...translations.manageOneGroup} />,
        onClick: onManageGroups,
      });
    }
    return result;
  }, [onManageGroups, canManageCategory]);

  return (
    <GroupCard
      subtitle={
        <FormattedMessage
          values={{ numMembers: members.length ?? 0 }}
          {...translations.subtitle}
        />
      }
      title={group.name}
      titleButtons={titleButton}
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
              <TableCell style={styles.rowHeight}>
                <div className="flex grow">
                  {m.isPhantom ? (
                    <img alt="phantom" className="wh-10" src={ghostIcon}/>
                  ) : (
                    ''
                  )}
                  {m.groupRole === 'manager' ? <b>{m.name}</b> : m.name}
                </div>
              </TableCell>
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
    </GroupCard>
  );
};

GroupTableCard.propTypes = {
  group: groupShape.isRequired,
  onManageGroups: PropTypes.func.isRequired,
  canManageCategory: PropTypes.bool.isRequired,
};

export default GroupTableCard;
