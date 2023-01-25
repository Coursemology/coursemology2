import { useMemo, useState } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import {
  Checkbox,
  Chip,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import PropTypes from 'prop-types';
import palette from 'theme/palette';

import GhostIcon from 'lib/components/icons/GhostIcon';

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
    id: 'course.group.GroupShow.CategoryCard.manageOneGroup',
    defaultMessage: 'Edit Group',
  },
  hidePhantomStudents: {
    id: 'course.group.GroupShow.GroupTableCard.hidePhantomStudents',
    defaultMessage: 'Hide all phantom students',
  },
});

const groupRoleTranslation = {
  normal: 'Member',
  manager: 'Manager',
  unknown: 'Unknown',
};

const translateStatus = (oldStatus) => {
  switch (oldStatus) {
    case 'normal':
      return groupRoleTranslation.normal;
    case 'manager':
      return groupRoleTranslation.manager;
    default:
      return groupRoleTranslation.unknown;
  }
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
    members = members.filter((m) => !m.isPhantom);
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
                  {m.name}
                  {m.isPhantom && <GhostIcon />}
                </div>
              </TableCell>
              <TableCell style={styles.rowHeight}>
                <Chip
                  label={translateStatus(m.groupRole)}
                  style={{
                    width: 100,
                    height: 23,
                    backgroundColor: palette.groupRole[m.groupRole],
                    marginTop: 0,
                    marginBottom: 0,
                  }}
                />
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
  onManageGroups: PropTypes.func.isRequired,
  canManageCategory: PropTypes.bool.isRequired,
};

export default GroupTableCard;
