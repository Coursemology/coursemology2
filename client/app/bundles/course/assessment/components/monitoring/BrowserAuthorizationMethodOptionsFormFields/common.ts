import { Control } from 'react-hook-form';

export const BROWSER_AUTHORIZATION_METHODS = [
  'user_agent',
  'seb_config_key',
] as const;

export type BrowserAuthorizationMethod =
  (typeof BROWSER_AUTHORIZATION_METHODS)[number];

export interface BrowserAuthorizationMethodOptionsProps {
  control: Control;
  pulsegridUrl?: string;
  disabled?: boolean;
  className?: string;
}
