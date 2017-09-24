import React from 'react';
import { Route, Switch } from 'react-router-dom';
import NotificationPopup from 'lib/containers/NotificationPopup';
import ObjectDuplication from 'course/duplication/pages/ObjectDuplication';

const DuplicationLayout = () => (
  <div>
    <NotificationPopup />

    <Switch>
      <Route exact path="/courses/:courseId/object_duplication/new" component={ObjectDuplication} />
    </Switch>
  </div>
 );

export default DuplicationLayout;
