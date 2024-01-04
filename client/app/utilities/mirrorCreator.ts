type StringOrNumber = string | number;

const mirrorCreator = <T extends StringOrNumber>(items: T[]): Record<T, T> => {
  const mirroredObject = <Record<T, T>>{};

  items.forEach((item) => {
    mirroredObject[item] = item;
  });
  return mirroredObject;
};

export default mirrorCreator;
