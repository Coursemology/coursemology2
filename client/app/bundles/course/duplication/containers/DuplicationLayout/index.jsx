import { Route, Routes } from 'react-router-dom';
import NotificationPopup from 'lib/containers/NotificationPopup';
import Duplication from 'course/duplication/pages/Duplication';

const DuplicationLayout = () => (
  <div>
    <NotificationPopup />

    <Routes>
      <Route
        exact
        path="/courses/:courseId/duplication"
        element={<Duplication />}
      />
    </Routes>
  </div>
);

export default DuplicationLayout;
