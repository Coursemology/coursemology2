import axios from 'axios';

export default function pollJob(url, onSuccess, onFailure) {
  const maxTimeout = 4000;
  let curTimeout = 500; // indicating the initial timeout

  let poller = setTimeout(function run() {
    axios
      .get(url, { params: { format : 'json' } })
      .then((response) => response.data)
      .then((data) => {
        if (data.status === 'completed') {
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

// export default function pollJob(url, interval, onSuccess, onFailure) {
//   const poller = setInterval(() => {
//     axios
//       .get(url, { params: { format: 'json' } })
//       .then((response) => response.data)
//       .then((data) => {
//         if (data.status === 'completed') {
//           clearInterval(poller);
//           onSuccess(data);
//         } else if (data.status === 'errored') {
//           clearInterval(poller);
//           onFailure(data);
//         }
//       })
//       .catch(() => {
//         clearInterval(poller);
//         onFailure();
//       });
//   }, interval);
// }
