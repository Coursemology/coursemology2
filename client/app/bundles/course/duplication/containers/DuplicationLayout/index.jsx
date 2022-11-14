import { Route, Routes } from 'react-router-dom';

import Duplication from 'course/duplication/pages/Duplication';
import NotificationPopup from 'lib/containers/NotificationPopup';

const DuplicationLayout = () => (
  <div>
    <NotificationPopup />

    <Routes>
      <Route
        element={<Duplication />}
        exact
        path="/courses/:courseId/duplication"
      />
    </Routes>
  </div>
);

export default DuplicationLayout;
