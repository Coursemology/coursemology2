import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';

import RagWiseSettingsForm from './components/forms/RagWiseSettingsForm';
import ForumList from './components/ForumList';
import MaterialList from './components/MaterialList';
import {
  fetchAllCourses,
  fetchAllFolders,
  fetchAllForums,
  fetchAllMaterials,
  fetchRagWiseSettings,
} from './operations';

const RagWiseSettings = (): JSX.Element => {
  return (
    <Preload
      render={<LoadingIndicator />}
      while={() =>
        Promise.all([
          fetchRagWiseSettings(),
          fetchAllMaterials(),
          fetchAllFolders(),
          fetchAllCourses(),
          fetchAllForums(),
        ])
      }
    >
      {([
        ragWiseSettings,
        materials,
        folders,
        courses,
        forums,
      ]): JSX.Element => {
        return (
          <>
            <RagWiseSettingsForm settings={ragWiseSettings} />
            <MaterialList
              rootFolder={
                folders.filter((folder) => folder.parentId === null)[0]
              }
            />
            <ForumList />
          </>
        );
      }}
    </Preload>
  );
};

export default RagWiseSettings;
