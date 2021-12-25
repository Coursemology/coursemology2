import { Route, Switch } from 'react-router-dom';

import Duplication from 'course/duplication/pages/Duplication';
import NotificationPopup from 'lib/containers/NotificationPopup';

const DuplicationLayout = () => (
  <div>
    <NotificationPopup />

    <Switch>
      <Route
        component={Duplication}
        exact={true}
        path="/courses/:courseId/duplication"
      />
    </Switch>
  </div>
);

export default DuplicationLayout;
