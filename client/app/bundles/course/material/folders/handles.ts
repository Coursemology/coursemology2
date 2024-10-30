import { getIdFromUnknown } from 'utilities';

import CourseAPI from 'api/course';
import { CrumbPath, DataHandle } from 'lib/hooks/router/dynamicNest';

export const loadDefaultMaterialId = async (): Promise<number> => {
  const {
    data: { id },
  } = await CourseAPI.materials.fetchDefault();
  return id;
};

const getFolderTitle = async (
  courseId: string,
  folderId: number,
): Promise<CrumbPath> => {
  const courseUrl = `/courses/${courseId}`;
  let data;
  try {
    ({ data } = await CourseAPI.folders.fetch(folderId));
  } catch (error) {
    const defaultMaterialId = await loadDefaultMaterialId();
    ({ data } = await CourseAPI.folders.fetch(defaultMaterialId));
  }

  const workbinUrl = `${courseUrl}/materials/folders/${data.breadcrumbs[0].id}`;

  return {
    activePath: workbinUrl,
    content: data.breadcrumbs.map((crumb) => ({
      title: crumb.name,
      url: `materials/folders/${crumb.id}`,
    })),
  };
};

/**
 * `shouldRevalidate` here relies on the invariant that `folderHandle` is attached to
 * a route that is stable across different folders, i.e., `/materials/folders`. This route
 * will be the pathname that the Dynamic Nest API's builder uses to reconcile the children
 * of the Workbin's crumb.
 *
 * Note that Workbin has only ONE crumb, but multiple children in its `content`. This strategy
 * is due to the fact that the Workbin's URL does not reflect any information of the nesting of
 * the folders. Thus, `useMatches` cannot notify `useDynamicNest` of the changes in the routes,
 * e.g., `useDynamicNest` cannot know if we move out from Folder 2 to Folder 1 from the URL.
 */
export const folderHandle: DataHandle = (match) => {
  const courseId = match.params?.courseId;
  const folderId = getIdFromUnknown(match.params?.folderId);
  if (!courseId) throw new Error(`Invalid course id: ${courseId}`);
  if (!folderId) throw new Error(`Invalid folder id: ${folderId}`);

  return {
    shouldRevalidate: true,
    getData: () => getFolderTitle(courseId, folderId),
  };
};
