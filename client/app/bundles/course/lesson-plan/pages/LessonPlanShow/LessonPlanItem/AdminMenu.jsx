import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';

const translations = defineMessages({
  deleteItemConfirmation: {
    id: 'course.lessonPlan.LessonPlanShow.LessonPlanItem.AdminMenu.deleteConfirmation',
    defaultMessage: 'Delete Lesson Plan Item?',
  },
  editItem: {
    id: 'course.lessonPlan.LessonPlanShow.LessonPlanItem.AdminMenu.editEvent',
    defaultMessage: 'Edit Item',
  },
  deleteItem: {
    id: 'course.lessonPlan.LessonPlanShow.LessonPlanItem.AdminMenu.deleteEvent',
    defaultMessage: 'Delete Item',
  },
});

const styles = {
  adminMenu: {
    top: 4,
    right: 4,
    position: 'absolute',
  },
};

const AdminMenu = ({ intl, editPath, deletePath }) => {
  if (!editPath || !deletePath) { return null; }

  return (
    <IconMenu
      iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
      anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
      targetOrigin={{ horizontal: 'right', vertical: 'top' }}
      style={styles.adminMenu}
    >
      {
        editPath && <MenuItem
          primaryText={intl.formatMessage(translations.editItem)}
          href={editPath}
        />
      }
      {
        deletePath && <MenuItem
          primaryText={intl.formatMessage(translations.deleteItem)}
          href={deletePath}
          data-method="delete"
          data-confirm={intl.formatMessage(translations.deleteItemConfirmation)}
        />
      }
    </IconMenu>
  );
};

AdminMenu.propTypes = {
  editPath: PropTypes.string,
  deletePath: PropTypes.string,
  intl: intlShape.isRequired,
};

export default injectIntl(AdminMenu);
