import { LoaderFunction, redirect } from 'react-router-dom';

import GlobalAPI from 'api';

export const masqueradeLoader: LoaderFunction = async ({ request }) => {
  await GlobalAPI.users.masquerade(request.url);
  return redirect('/');
};

export const stopMasqueradeLoader: LoaderFunction = async ({ request }) => {
  await GlobalAPI.users.stopMasquerade(request.url);
  return redirect('/admin/users');
};
