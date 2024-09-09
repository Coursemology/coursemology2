import { useMemo } from 'react';
import {
  LanguageData,
  LanguageMode,
} from 'types/course/assessment/question/programming';

export interface LanguageOption {
  label: string;
  value: number;
  disabled: boolean;
}

type LanguageIdMap = Record<number, LanguageMode>;

interface UseLanguageModeHook {
  languageOptions: LanguageOption[];
  getModeFromId: (id: number) => LanguageMode;
}

const useLanguageMode = (languages: LanguageData[]): UseLanguageModeHook => {
  const [languageOptions, languageIdToModeMap] = useMemo(
    () =>
      languages.reduce<[LanguageOption[], LanguageIdMap]>(
        ([options, map], language) => {
          options.push({
            label: language.name,
            value: language.id,
            disabled: language.disabled,
          });

          map[language.id] = language.editorMode;

          return [options, map];
        },
        [[], {}],
      ),
    [],
  );

  const getModeFromId = (id: number): LanguageMode => languageIdToModeMap[id];

  return { languageOptions, getModeFromId };
};

export default useLanguageMode;
