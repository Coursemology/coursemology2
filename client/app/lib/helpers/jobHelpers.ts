import { AxiosError } from 'axios';
import { JobCompleted, JobErrored } from 'types/jobs';

import GlobalAPI from 'api';

const MIN_POLLING_INTERVAL = 250;
const MAX_POLLING_INTERVAL = 4000;

const pollJob = (
  jobUrl: string,
  onSuccess: (data: JobCompleted) => void,
  onFailure: (error: JobErrored | AxiosError) => void,
  minPollInterval = MIN_POLLING_INTERVAL,
  maxPollInterval = MAX_POLLING_INTERVAL,
): void => {
  if (minPollInterval > maxPollInterval)
    throw new Error('minDelay should be lower than maxDelay.');

  let curTimeout = minPollInterval;
  const maxTimeout = maxPollInterval;

  let poller = setTimeout(function run() {
    GlobalAPI.jobs
      .get(jobUrl)
      .then((response) => {
        switch (response.data.status) {
          case 'submitted':
            if (curTimeout < maxTimeout) curTimeout *= 2;
            poller = setTimeout(run, curTimeout);
            break;
          case 'completed':
            clearTimeout(poller);
            onSuccess(response.data);
            break;
          case 'errored':
            clearTimeout(poller);
            onFailure(response.data);
            break;
          default:
            throw new Error('Unknown job status');
        }
      })
      .catch((error) => {
        clearTimeout(poller);
        onFailure(error);
      });
  }, curTimeout);
};

export default pollJob;
