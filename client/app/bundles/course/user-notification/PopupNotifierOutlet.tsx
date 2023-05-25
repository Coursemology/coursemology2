import { Outlet } from 'react-router-dom';

import PopupNotifier from './PopupNotifier';

/**
 * Will soon be replaced with `CourseContainer`.
 */
const PopupNotifierOutlet = (): JSX.Element => (
  <>
    <Outlet />
    <PopupNotifier />
  </>
);

export default PopupNotifierOutlet;
