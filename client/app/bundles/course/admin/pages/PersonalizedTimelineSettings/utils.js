const createLearningRateMap = (minLearningRate, maxLearningRate) => {
  const result = new Map();
  for (
    let d = Math.floor(minLearningRate / 10) * 10;
    d <= Math.floor(maxLearningRate / 10) * 10;
    d += 10
  ) {
    result.set(d, 0);
  }
  return result;
};

const createDateMap = (startDate, endDate) => {
  const result = new Map();
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    result.set(d.getTime(), []);
  }
  return result;
};

// eslint-disable-next-line import/prefer-default-export
export const processLearningRateRecordsIntoChartData = (
  learningRateRecords,
) => {
  if (!learningRateRecords) {
    return [[], 0, 0];
  }
  let minLearningRate;
  let maxLearningRate;
  let minCreatedAt;
  let maxCreatedAt;

  const records = learningRateRecords.flatMap((r) => r.records);
  records.forEach((r) => {
    if (minLearningRate == null || r.learningRate < minLearningRate) {
      minLearningRate = r.learningRate;
    }
    if (maxLearningRate == null || r.learningRate > maxLearningRate) {
      maxLearningRate = r.learningRate;
    }
    if (minCreatedAt == null || r.createdAt < minCreatedAt) {
      minCreatedAt = r.createdAt;
    }
    if (maxCreatedAt == null || r.createdAt > maxCreatedAt) {
      maxCreatedAt = r.createdAt;
    }
  });

  const map = createDateMap(minCreatedAt, maxCreatedAt);
  learningRateRecords.forEach((user) => {
    let currentDate = minCreatedAt.getTime();
    let currentLearningRate = 100;

    user.records.forEach((r) => {
      if (r.createdAt.getTime() === currentDate) {
        currentLearningRate = r.learningRate;
        return;
      }
      for (
        let d = new Date(currentDate);
        d < r.createdAt;
        d.setDate(d.getDate() + 1)
      ) {
        map.get(d.getTime()).push(currentLearningRate);
      }
      currentLearningRate = r.learningRate;
      currentDate = r.createdAt.getTime();
    });

    for (
      let d = new Date(currentDate);
      d <= maxCreatedAt;
      d.setDate(d.getDate() + 1)
    ) {
      map.get(d.getTime()).push(currentLearningRate);
    }
  });

  const result = [];
  for (
    let d = new Date(minCreatedAt);
    d <= maxCreatedAt;
    d.setDate(d.getDate() + 1)
  ) {
    const learningRates = map.get(d.getTime());
    const learningRateMap = createLearningRateMap(
      minLearningRate,
      maxLearningRate,
    );

    learningRates.forEach((r) => {
      const key = Math.floor(r / 10) * 10;
      const value = learningRateMap.get(key);
      learningRateMap.set(key, value + 1);
    });

    learningRateMap.forEach((value, key) => {
      result.push({
        x: new Date(d),
        y: key,
        v: value,
      });
    });
  }

  return [
    result,
    map.size,
    createLearningRateMap(minLearningRate, maxLearningRate).size,
    Math.floor(minLearningRate / 10) * 10,
    Math.floor(maxLearningRate / 10) * 10,
  ];
};
