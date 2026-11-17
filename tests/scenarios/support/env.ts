import * as path from 'path';

import { scenarioServers } from '../../package.json';

/**
 * Settings for running scenarios against a local development server. The client's URL defaults to the
 * one in `package.json`. The rest vary between developer setups, so they come from the environment.
 */

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is not set. Scenarios sign in as an existing instance administrator on the ` +
        'development server; see tests/scenarios/README.md.',
    );
  }
  return value;
};

export const devServer = {
  /** Where the development client is served, e.g. `yarn build:development-https` serves lvh.me. */
  baseURL: process.env.CM_DEV_BASE_URL ?? scenarioServers.clientURL,

  /**
   * The Rails development log of the server being driven. Mail isn't delivered in development;
   * ActionMailer logs each message here instead, and scenarios read invitation links from it.
   */
  logPath: path.resolve(
    process.env.CM_DEV_LOG_PATH ?? path.join(__dirname, '../../../log/development.log'),
  ),
};

export const getAdminCredentials = (): { email: string; password: string } => ({
  email: required('CM_DEV_ADMIN_EMAIL'),
  password: required('CM_DEV_ADMIN_PASSWORD'),
});
