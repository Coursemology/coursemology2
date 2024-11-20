import { produce } from 'immer';

import { Descriptor } from 'lib/hooks/useTranslation';

import { isRecord, Match } from './utils';

export type CrumbTitle = string | Descriptor | null | undefined;

export interface CrumbContent {
  url?: string;
  title?: CrumbTitle;
}

export interface CrumbData {
  id: string;
  pathname: string;
  activePath?: string | null;
  content?: CrumbContent | CrumbContent[];
}

export interface CrumbPath {
  pathname?: string;
  activePath?: string | null;
  content?: CrumbContent | CrumbContent[];
}

export type CrumbState = Record<string, CrumbData>;

export const getLastCrumbTitle = (crumbs: CrumbData[]): CrumbTitle | null => {
  const content = crumbs[crumbs.length - 1]?.content;
  if (!content) return null;

  const actualContent = Array.isArray(content)
    ? content[content.length - 1]
    : content;
  if (!actualContent) return null;

  return actualContent.title;
};

export const isCrumbPath = (value: unknown): value is CrumbPath =>
  isRecord(value) && 'content' in value;

export const buildCrumbData = (
  match: Match,
  data: CrumbTitle | CrumbPath,
): CrumbData => ({
  id: match.id,
  pathname: match.pathname,
  ...(isCrumbPath(data)
    ? data
    : {
        content: {
          title: data,
          url: match.pathname,
        },
      }),
});

export const combineCrumbs = (
  delta: CrumbData[],
): ((state: CrumbState) => CrumbState) =>
  produce((draft) => {
    delta.forEach((crumb) => {
      draft[crumb.pathname] = crumb;
    });
  });
