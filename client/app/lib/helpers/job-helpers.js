import axios from 'axios';

export default function pollJob(url, interval, onSuccess, onFailure) {
  const poller = setInterval(() => {
    axios
      .get(url, { params: { format: 'json' } })
      .then((response) => response.data)
      .then((data) => {
        if (data.status === 'completed') {
          clearInterval(poller);
          onSuccess(data);
        } else if (data.status === 'errored') {
          clearInterval(poller);
          onFailure(data);
        }
      })
      .catch(() => {
        clearInterval(poller);
        onFailure();
      });
  }, interval);
}
