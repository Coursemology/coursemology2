import axios from 'axios';

export default function pollJob(url, minDelay, maxDelay, onSuccess, onFailure) {
  const maxTimeout = maxDelay;
  let curTimeout = minDelay; // indicating the initial timeout

  let poller = setTimeout(function run() {
    axios
      .get(url, { params: { format: 'json' } })
      .then((response) => response.data)
      .then((data) => {
        if (minDelay > maxDelay) {
          clearTimeout(poller);
          onFailure();
        } else if (data.status === 'completed') {
          clearTimeout(poller);
          onSuccess(data);
        } else if (data.status === 'errored') {
          clearTimeout(poller);
          onFailure(data);
        } else {
          if (curTimeout < maxTimeout) {
            curTimeout *= 2;
          }
          poller = setTimeout(run, curTimeout);
        }
      })
      .catch(() => {
        clearTimeout(poller);
        onFailure();
      });
  }, curTimeout);
}
