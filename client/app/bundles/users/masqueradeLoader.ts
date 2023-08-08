import { defineMessages } from 'react-intl';
import { LoaderFunction, redirect } from 'react-router-dom';

import GlobalAPI from 'api';
import toast from 'lib/hooks/toast';
import { Translated } from 'lib/hooks/useTranslation';

const translations = defineMessages({
  errorMasquerading: {
    id: 'client.users.masqueradeLoader.errorMasquerading',
    defaultMessage: 'An error occurred while masquerading. Try again later.',
  },
  errorStoppingMasquerade: {
    id: 'client.users.masqueradeLoader.errorStoppingMasquerade',
    defaultMessage:
      'An error occurred while stopping masquerade. Try again later.',
  },
});

export const masqueradeLoader: Translated<LoaderFunction> =
  (t) =>
  async ({ request }) => {
    try {
      await GlobalAPI.users.masquerade(request.url);
      return redirect('/');
    } catch {
      toast.error(t(translations.errorMasquerading));
      return redirect('/');
    }
  };

export const stopMasqueradeLoader: Translated<LoaderFunction> =
  (t) =>
  async ({ request }) => {
    try {
      await GlobalAPI.users.stopMasquerade(request.url);
      return redirect('/admin/users');
    } catch {
      toast.error(t(translations.errorStoppingMasquerade));
      return redirect('/');
    }
  };
