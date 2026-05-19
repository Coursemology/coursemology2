import { RefObject, useLayoutEffect, useRef, useState } from 'react';

export const useStickyHeaderOffsets = (
  rowCount: number,
  deps: unknown[],
): {
  rowRefs: RefObject<HTMLTableRowElement>[];
  rowTops: number[];
} => {
  const rowRefs = useRef<RefObject<HTMLTableRowElement>[]>([]);
  if (rowRefs.current.length !== rowCount) {
    rowRefs.current = Array.from(
      { length: rowCount },
      (_, i) => rowRefs.current[i] ?? { current: null },
    );
  }

  const [rowTops, setRowTops] = useState<number[]>(() =>
    Array(rowCount).fill(0),
  );

  useLayoutEffect(() => {
    const compute = (): void => {
      const heights = rowRefs.current.map(
        (ref) => ref.current?.offsetHeight ?? 0,
      );
      const tops: number[] = [];
      let acc = 0;
      for (let i = 0; i < rowCount; i += 1) {
        tops.push(acc);
        acc += heights[i];
      }
      setRowTops(tops);
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowCount, ...deps]);

  return { rowRefs: rowRefs.current, rowTops };
};
