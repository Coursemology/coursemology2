import { Outlet } from 'react-router-dom';

import Page from 'lib/components/core/layouts/Page';

const QuestionFormOutlet = (): JSX.Element => (
  <Page>
    <Outlet />
  </Page>
);

export default QuestionFormOutlet;
