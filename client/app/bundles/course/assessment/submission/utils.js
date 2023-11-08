export function arrayToObjectById(array) {
  return array.reduce((obj, item) => ({ ...obj, [item.id]: item }), {});
}

export function capitaliseFirstLetter(word) {
  if (word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }
  return '';
}

const parsedLanguages = {
  'C/C++': 'c_cpp',
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

export function parseLanguages(language) {
  const parsedLanguage = parsedLanguages[language];
  if (!parsedLanguage) {
    return '';
  }

  return parsedLanguage;
}
