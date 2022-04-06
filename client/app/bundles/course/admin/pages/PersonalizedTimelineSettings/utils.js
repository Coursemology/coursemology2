export const LEARNING_RATE_BUCKET_SIZE = 5; // i.e. every 5%

const nearestMultipleOfBucketSize = (value) =>
  Math.floor(value / LEARNING_RATE_BUCKET_SIZE) * LEARNING_RATE_BUCKET_SIZE;

const createLearningRateMap = (minLearningRate, maxLearningRate) => {
  const result = new Map();
  for (
    let d = nearestMultipleOfBucketSize(minLearningRate);
    d <= nearestMultipleOfBucketSize(maxLearningRate);
    d += LEARNING_RATE_BUCKET_SIZE
  ) {
    result.set(d, 0);
  }
  return result;
};

const createDateMap = (
  startDate,
  endDate,
  minLearningRate,
  maxLearningRate,
) => {
  const result = new Map();
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    result.set(
      d.getTime(),
      createLearningRateMap(minLearningRate, maxLearningRate),
    );
  }
  return result;
};

// eslint-disable-next-line import/prefer-default-export
export const processLearningRateRecordsIntoChartData = (
  learningRateRecords,
) => {
  if (!learningRateRecords) {
    return [[], 0, 0, 0];
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

  const map = createDateMap(
    minCreatedAt,
    maxCreatedAt,
    minLearningRate,
    maxLearningRate,
  );
  learningRateRecords.forEach((user) => {
    let currentDate = minCreatedAt.getTime();
    let currentLearningRate = 100;

    user.records.forEach((r) => {
      if (r.createdAt.getTime() === currentDate) {
        // This handles the case where the student's learning rate changes multiple times in a single day
        // We only want to keep the latest copy
        currentLearningRate = r.learningRate;
        return;
      }

      for (
        let d = new Date(currentDate);
        d < r.createdAt;
        d.setDate(d.getDate() + 1)
      ) {
        const currentCount = map
          .get(d.getTime())
          .get(nearestMultipleOfBucketSize(currentLearningRate));
        map
          .get(d.getTime())
          .set(
            nearestMultipleOfBucketSize(currentLearningRate),
            currentCount + 1,
          );
      }
      currentLearningRate = r.learningRate;
      currentDate = r.createdAt.getTime();
    });

    // Go from the last record until the latest date
    for (
      let d = new Date(currentDate);
      d <= maxCreatedAt;
      d.setDate(d.getDate() + 1)
    ) {
      const currentCount = map
        .get(d.getTime())
        .get(nearestMultipleOfBucketSize(currentLearningRate));
      map
        .get(d.getTime())
        .set(
          nearestMultipleOfBucketSize(currentLearningRate),
          currentCount + 1,
        );
    }
  });

  const result = [];
  const values = [];
  for (
    let d = new Date(minCreatedAt);
    d <= maxCreatedAt;
    d.setDate(d.getDate() + 1)
  ) {
    const learningRateMap = map.get(d.getTime());
    learningRateMap.forEach((value, key) => {
      result.push({
        x: new Date(d),
        y: key,
        v: value,
      });
      values.push(value);
    });
  }

  // This is to compute the highest value for the color scale later.
  // Get data point at 98th percentile so that extreme values are handled.
  // This is what seaborn does as well.
  const maxV = values.sort((a, b) => a - b)[Math.floor(values.length * 0.98)];

  return [
    result,
    map.size, // x-axis size
    (nearestMultipleOfBucketSize(maxLearningRate) -
      nearestMultipleOfBucketSize(minLearningRate)) /
      LEARNING_RATE_BUCKET_SIZE,
    maxV,
  ];
};
