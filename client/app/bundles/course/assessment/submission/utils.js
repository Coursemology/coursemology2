export function arrayToObjectById(array) {
  return array.reduce((obj, item) => ({ ...obj, [item.id]: item }), {});
}

export function capitaliseFirstLetter(word) {
  if (word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }
  return '';
}

export function parseLanguages(language) {
  switch (language) {
    case 'C/C++':
      return 'c_cpp';
    case 'Java 8':
    case 'Java 11':
    case 'Java 17':
    case 'Java':
      return 'java';
    case 'Python 3.12':
    case 'Python 3.10':
    case 'Python 3.9':
    case 'Python 3.7':
    case 'Python 3.6':
    case 'Python 3.5':
    case 'Python 3.4':
    case 'Python 2.7':
      return 'python';
    default:
      return '';
  }
}
