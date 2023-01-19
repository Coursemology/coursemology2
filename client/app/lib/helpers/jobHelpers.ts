import { AxiosError } from 'axios';
import { JobCompleted, JobErrored } from 'types/jobs';

import GlobalAPI from 'api';

const pollJob = (
  jobUrl: string,
  onSuccess: (data: JobCompleted) => void,
  onFailure: (error: JobErrored | AxiosError) => void,
  pollInterval: number,
): void => {
  const poller = setInterval(() => {
    GlobalAPI.jobs
      .get(jobUrl)
      .then((response) => {
        switch (response.data.status) {
          case 'submitted':
            break;
          case 'completed':
            clearInterval(poller);
            onSuccess(response.data);
            break;
          case 'errored':
            clearInterval(poller);
            onFailure(response.data);
            break;
          default:
            throw new Error('Unknown job status');
        }
      })
      .catch((error) => {
        clearInterval(poller);
        onFailure(error);
      });
  }, pollInterval);
};

export default pollJob;
