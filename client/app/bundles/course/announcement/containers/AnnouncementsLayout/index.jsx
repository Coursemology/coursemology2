import React from 'react';
import { withRouter, Route, Switch } from 'react-router-dom';
import NotificationPopup from 'lib/containers/NotificationPopup';
import DeleteConfirmation from 'lib/containers/DeleteConfirmation';
import AnnouncementIndex from 'course/announcement/pages/AnnouncementIndex';

const AnnouncementsLayout = () => {
  const announcementRoot = '/courses/:courseId/announcements';
  return (
    <div>
      <DeleteConfirmation />
      <NotificationPopup />

      <Switch>
        <Route exact path={announcementRoot} component={AnnouncementIndex} />
      </Switch>
    </div>
  );
};

export default withRouter(AnnouncementsLayout);
