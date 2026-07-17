import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
} from 'react';

export interface PreviewContextValue {
  courseId: number;
  assessmentId: number;
  submissionId: number;
  isPreview: true;
}

const PreviewContext = createContext<PreviewContextValue | null>(null);

// Read outside React (the class-based API layer, T11) needs a non-hook accessor.
let activePreview: PreviewContextValue | null = null;
export const setActivePreview = (value: PreviewContextValue | null): void => {
  activePreview = value;
};
export const getActivePreview = (): PreviewContextValue | null => activePreview;

interface PreviewProviderProps {
  courseId: number;
  assessmentId: number;
  submissionId: number;
  children: ReactNode;
}

export const PreviewProvider: FC<PreviewProviderProps> = ({
  courseId,
  assessmentId,
  submissionId,
  children,
}) => {
  const value = useMemo<PreviewContextValue>(
    () => ({ courseId, assessmentId, submissionId, isPreview: true }),
    [courseId, assessmentId, submissionId],
  );

  // Mirror into the module-scoped accessor so the class-based Submissions API (T11), which
  // cannot use a React hook, can read the active preview scope. Cleared on unmount so a
  // dismounted preview subtree never leaks its scope into a subsequent non-preview submission.
  // Assumes a single PreviewProvider subtree is ever mounted at once — nesting providers would
  // have the inner one's unmount-cleanup clear the outer one's still-active scope (child effects
  // fire/cleanup before parent effects), so "innermost wins" does not hold if nested.
  useEffect(() => {
    setActivePreview(value);
    return () => setActivePreview(null);
  }, [value]);

  return (
    <PreviewContext.Provider value={value}>{children}</PreviewContext.Provider>
  );
};

export const usePreviewContext = (): PreviewContextValue | null =>
  useContext(PreviewContext);
