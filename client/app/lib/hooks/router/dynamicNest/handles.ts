import { Location } from 'react-router-dom';

import { CrumbPath, CrumbTitle } from './crumbs';
import { isRecord, Match, Promisable } from './utils';

interface HandleRequest {
  shouldRevalidate?: boolean;
  getData: () => Promisable<CrumbTitle | CrumbPath>;
}

export type HandleData = CrumbTitle | HandleRequest | null;

export type DataHandle = (match: Match, location: Location) => HandleData;

export type Handle = CrumbTitle | DataHandle;

export const isHandleRequest = (value: unknown): value is HandleRequest =>
  isRecord(value) && 'getData' in value && typeof value.getData === 'function';

export const getHandleData = (match: Match, location: Location): HandleData => {
  const handle = match.handle as Handle | undefined;
  if (!handle) return null;

  return typeof handle === 'function' ? handle(match, location) : handle;
};

export const getShouldRevalidateCrumb = (data: HandleData): boolean =>
  isHandleRequest(data) && (data.shouldRevalidate ?? false);

export const getHandleRequestData = (
  data: HandleData,
): Promisable<CrumbTitle | CrumbPath> =>
  isHandleRequest(data) ? data.getData() : data;
