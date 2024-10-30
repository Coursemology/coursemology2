import { LoaderFunction, redirect } from 'react-router-dom';
import { getIdFromUnknown } from 'utilities';

import CourseAPI from 'api/course';

const folderLoader: LoaderFunction = async ({ params }) => {
  const folderId = getIdFromUnknown(params?.folderId);
  if (!folderId) return redirect('/');

  const { data } = await CourseAPI.folders.fetch(folderId);

  return data;
};

export default folderLoader;
