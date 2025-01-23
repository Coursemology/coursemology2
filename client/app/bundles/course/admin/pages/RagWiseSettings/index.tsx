import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';

import RagWiseSettingsForm from './components/forms/RagWiseSettingsForm';
import MaterialList from './components/MaterialList';
import {
  fetchAllFolders,
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
        ])
      }
    >
      {([ragWiseSettings, materials, folders]): JSX.Element => {
        return (
          <>
            <RagWiseSettingsForm settings={ragWiseSettings} />
            <MaterialList
              rootFolder={
                folders.filter((folder) => folder.parentId === null)[0]
              }
            />
          </>
        );
      }}
    </Preload>
  );
};

export default RagWiseSettings;
