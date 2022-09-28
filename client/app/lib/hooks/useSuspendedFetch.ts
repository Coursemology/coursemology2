import useSWR from 'swr';

type Fetcher<Data> = () => Promise<Data>;

type SuspendedFetchHook = <Data>(fetcher: Fetcher<Data>) => {
  data: Data;
  error: Error;
  update: (data: Data) => void;
};

/**
 * According to SWR's documentation as of v1.3.0, `useSWR` with `suspense: true`
 * will always guarantee the return value, so it is technically impossible for
 * the return value to be `undefined`. Read here: https://swr.vercel.app/docs/suspense.
 * For some reasons, `useSWR` below still returns `data` as `Data | undefined`, hence
 * the `data!`. Seems like this issue is just TypeScript typing problem, and
 * it is being tracked here: https://github.com/vercel/swr/issues/1412.
 * @param fetcher a function that does the network fetch and returns the data
 * @returns the actual data (guaranteed to never be `undefined`) and errors (if any)
 */
const useSuspendedFetch: SuspendedFetchHook = (fetcher) => {
  const { data, error, mutate } = useSWR(fetcher.name, fetcher, {
    suspense: true,
    revalidateOnFocus: false,
  });

  return { data: data!, error, update: mutate };
};

export default useSuspendedFetch;
