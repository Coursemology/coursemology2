import { AxiosResponse } from 'axios';

export type APIResponse<T = void> = Promise<AxiosResponse<T>>;

export interface JustRedirect {
  redirectUrl: string;
}
