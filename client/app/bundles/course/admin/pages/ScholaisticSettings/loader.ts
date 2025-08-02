import { LoaderFunction, useLoaderData } from 'react-router-dom';
import { ScholaisticSettingsData } from 'types/course/admin/scholaistic';

import { fetchScholaisticSettings } from './operations';

export const loader: LoaderFunction = async () => fetchScholaisticSettings();

export const useLoader = (): ScholaisticSettingsData =>
  useLoaderData() as ScholaisticSettingsData;
