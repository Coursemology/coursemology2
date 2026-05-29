import reducer, { actions } from '../store';

const baseState = {
  categories: [],
  tabs: [
    { id: 1, title: 'T1', categoryId: 1, gradebookWeight: 50 },
    { id: 2, title: 'T2', categoryId: 1, gradebookWeight: 50 },
  ],
  assessments: [],
  students: [],
  submissions: [],
  gamificationEnabled: false,
  userId: 0,
  weightedViewEnabled: false,
  canManageWeights: false,
};

describe('UPDATE_TAB_WEIGHTS reducer', () => {
  it('updates gradebookWeight for the matching tab', () => {
    const next = reducer(
      baseState,
      actions.updateTabWeights({ weights: [{ tabId: 1, weight: 80 }] }),
    );
    expect(next.tabs.find((t) => t.id === 1)?.gradebookWeight).toBe(80);
    expect(next.tabs.find((t) => t.id === 2)?.gradebookWeight).toBe(50);
  });

  it('does not set any excluded field', () => {
    const next = reducer(
      baseState,
      actions.updateTabWeights({ weights: [{ tabId: 1, weight: 0 }] }),
    );
    const tab = next.tabs.find((t) => t.id === 1)!;
    expect(tab).not.toHaveProperty('gradebookExcluded');
  });

  it('updates multiple tabs in one action', () => {
    const next = reducer(
      baseState,
      actions.updateTabWeights({
        weights: [
          { tabId: 1, weight: 30 },
          { tabId: 2, weight: 70 },
        ],
      }),
    );
    expect(next.tabs.find((t) => t.id === 1)?.gradebookWeight).toBe(30);
    expect(next.tabs.find((t) => t.id === 2)?.gradebookWeight).toBe(70);
  });
});
