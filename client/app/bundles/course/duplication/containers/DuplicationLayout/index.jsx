import React from 'react';
import { Route, Switch } from 'react-router-dom';
import NotificationPopup from 'lib/containers/NotificationPopup';
import Duplication from 'course/duplication/pages/Duplication';

const DuplicationLayout = () => (
  <div>
    <NotificationPopup />

    <Switch>
      <Route exact path="/courses/:courseId/duplication" component={Duplication} />
    </Switch>
  </div>
);

export default DuplicationLayout;
