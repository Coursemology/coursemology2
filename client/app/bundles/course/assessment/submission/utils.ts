const ProgrammingLanguageMapper = {
  'C/C++': 'c_cpp',
  'C++ 11': 'c_cpp',
  'C++ 17': 'c_cpp',
  'Java 8': 'java',
  'Java 11': 'java',
  'Java 17': 'java',
  Java: 'java',
  'Python 3.12': 'python',
  'Python 3.10': 'python',
  'Python 3.9': 'python',
  'Python 3.7': 'python',
  'Python 3.6': 'python',
  'Python 3.5': 'python',
  'Python 3.4': 'python',
  'Python 2.7': 'python',
};

export const parseLanguages = (
  language: keyof typeof ProgrammingLanguageMapper,
): string => {
  const parsedLanguage = ProgrammingLanguageMapper[language];
  if (!parsedLanguage) {
    return '';
  }

  return parsedLanguage;
};
