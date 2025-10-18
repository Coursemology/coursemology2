import { AxiosError } from 'axios';
import { JobCompleted, JobErrored, JobStatusResponse } from 'types/jobs';

import GlobalAPI from 'api';

export async function pollJobRequest(
  jobUrl: string,
): Promise<JobStatusResponse> {
  return (await GlobalAPI.jobs.get(jobUrl)).data;
}

/*
 * DO NOT USE the below function, it leaves behind orphaned pollers which cause issues
 * on page refresh / navigation. Instead, set up / tear down the pollers in the page component
 * properly with useEffect().
 */
const pollJob = (
  jobUrl: string,
  onSuccess: (data: JobCompleted) => void,
  onFailure: (error: JobErrored | AxiosError) => void,
  pollInterval: number,
): void => {
  const poller = setInterval(() => {
    pollJobRequest(jobUrl)
      .then((response) => {
        switch (response.status) {
          case 'submitted':
            break;
          case 'completed':
            clearInterval(poller);
            onSuccess(response);
            break;
          case 'errored':
            clearInterval(poller);
            onFailure(response);
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
