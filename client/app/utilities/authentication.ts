import { User } from 'oidc-client-ts';

const OIDC_STORAGE_KEY =
  `oidc.user:${process.env.OIDC_AUTHORITY}:${process.env.OIDC_CLIENT_ID}` as const;

export const getUserToken = (): string => {
  const oidcStorage = localStorage.getItem(OIDC_STORAGE_KEY);

  if (!oidcStorage) {
    return '';
  }
  const user = User.fromStorageString(oidcStorage);
  return user.access_token;
};
