import { LoaderFunction, redirect } from 'react-router-dom';
import { getIdFromUnknown } from 'utilities';

import CourseAPI from 'api/course';

const materialLoader: LoaderFunction = async ({ params }) => {
  const folderId = getIdFromUnknown(params?.folderId);
  const materialId = getIdFromUnknown(params?.materialId);
  if (!folderId || !materialId) return redirect('/');

  const { data } = await CourseAPI.materials.fetch(folderId, materialId);

  return data;
};

export default materialLoader;
