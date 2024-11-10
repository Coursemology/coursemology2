import { useMemo } from 'react';
import { LanguageData } from 'types/course/assessment/question/programming';

export type LanguageOption = Omit<LanguageData, 'id' | 'name'> & {
  label: string;
  value: number;
};

type LanguageIdMap = Record<number, LanguageData>;

interface UseLanguageModeHook {
  languageOptions: LanguageOption[];
  getDataFromId: (id: number) => LanguageData;
}

const useLanguageMode = (languages: LanguageData[]): UseLanguageModeHook => {
  const [languageOptions, languageIdToModeMap] = useMemo(
    () =>
      languages.reduce<[LanguageOption[], LanguageIdMap]>(
        ([options, map], language) => {
          const option = {
            label: language.name,
            value: language.id,
            disabled: language.disabled,
            editorMode: language.editorMode,
            whitelists: {
              codaveriEvaluator: language.whitelists.codaveriEvaluator,
              defaultEvaluator: language.whitelists.defaultEvaluator,
            },
          };
          options.push(option);
          map[language.id] = language;

          return [options, map];
        },
        [[], {}],
      ),
    [],
  );

  const getDataFromId = (id: number): LanguageData => languageIdToModeMap[id];

  return { languageOptions, getDataFromId };
};

export default useLanguageMode;
