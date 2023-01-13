import { AxiosResponse } from 'axios';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type APIResponse<T = any, D = any> = Promise<AxiosResponse<T, D>>;
