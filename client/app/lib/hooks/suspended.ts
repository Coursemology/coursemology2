/* eslint-disable @typescript-eslint/no-throw-literal */
enum Status {
  Pending,
  Success,
  Error,
}

interface SuspendedPromise<Result> {
  read: () => Result;
}

const suspend = <Result>(
  promise: Promise<Result>,
): SuspendedPromise<Result> => {
  let status = Status.Pending;
  let result: Result;

  const suspender = promise
    .then((response) => {
      status = Status.Success;
      result = response;
    })
    .catch((error) => {
      status = Status.Error;
      result = error;
    });

  return {
    read(): Result {
      switch (status) {
        case Status.Pending:
          throw suspender;
        case Status.Error:
          throw result;
        case Status.Success:
          return result;
        default:
          return result;
      }
    },
  };
};

export default suspend;
