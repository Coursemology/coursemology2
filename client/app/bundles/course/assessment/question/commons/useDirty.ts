import { useState } from 'react';
import { castDraft, produce } from 'immer';

interface UseDirtyHook<T> {
  isDirty: boolean;
  mark: (id: T, dirty: boolean) => void;
  reset: () => void;
  marker: (id: T) => (dirty: boolean) => void;
}

const useDirty = <T>(): UseDirtyHook<T> => {
  const [dirtyIds, setDirtyIds] = useState(new Set<T>());

  const mark: UseDirtyHook<T>['mark'] = (id, dirty) =>
    setDirtyIds(
      produce((draft) => {
        if (dirty) {
          draft.add(castDraft(id));
        } else {
          draft.delete(castDraft(id));
        }
      }),
    );

  return {
    isDirty: Boolean(dirtyIds.size),
    mark,
    marker: (id) => (dirty) => mark(id, dirty),
    reset: (): void => setDirtyIds(new Set()),
  };
};

export default useDirty;
