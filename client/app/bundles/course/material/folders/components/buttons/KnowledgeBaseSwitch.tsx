// currently not in use
import { FC, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { Switch } from '@mui/material';

import { MATERIAL_WORKFLOW_STATE } from 'lib/constants/sharedConstants';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { chunkMaterial, removeChunks } from '../../operations';

interface Props {
  currFolderId: number;
  itemId: number;
  itemName: string;
  isConcrete: boolean;
  canEdit: boolean;
  state: keyof typeof MATERIAL_WORKFLOW_STATE;
  type: 'subfolder' | 'material';
}

const translations = defineMessages({
  addSuccess: {
    id: 'course.material.folders.WorkbinTableButtons.addFailure',
    defaultMessage: '{material} has been added to knowledge base',
  },
  addFailure: {
    id: 'course.material.folders.WorkbinTableButtons.addFailure',
    defaultMessage: '{material} could not be added to knowledge base',
  },
  removeSuccess: {
    id: 'course.material.folders.WorkbinTableButtons.removeSuccess',
    defaultMessage: '{material} has been removed from knowledge base',
  },
  removeFailure: {
    id: 'course.material.folders.WorkbinTableButtons.removeFailure',
    defaultMessage: '{material} could not be removed from knowledge base',
  },
});

const KnowledgeBaseSwitch: FC<Props> = (props) => {
  const { currFolderId, itemId, itemName, isConcrete, canEdit, state, type } =
    props;
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const onAdd = (): void => {
    setIsLoading(true);
    dispatch(
      chunkMaterial(
        currFolderId,
        itemId,
        () => {
          setIsLoading(false);
          toast.success(
            t(translations.addSuccess, {
              material: itemName,
            }),
          );
        },
        () => {
          setIsLoading(false);
          toast.error(
            t(translations.addFailure, {
              material: itemName,
            }),
          );
        },
      ),
    );
  };

  const onRemove = (): Promise<void> => {
    setIsLoading(true);
    return dispatch(removeChunks(currFolderId, itemId))
      .then(() => {
        setIsLoading(false);
        toast.success(
          t(translations.removeSuccess, {
            material: itemName,
          }),
        );
      })
      .catch((error) => {
        setIsLoading(false);
        toast.error(
          t(translations.removeFailure, {
            material: itemName,
          }),
        );
        throw error;
      });
  };

  useEffect(() => {
    if (state === MATERIAL_WORKFLOW_STATE.chunking && !isLoading) {
      onAdd();
      setIsLoading(true);
    }
  }, [isLoading]);

  return (
    type === 'material' &&
    canEdit &&
    isConcrete && (
      <Switch
        checked={state === MATERIAL_WORKFLOW_STATE.chunked}
        color="primary"
        disabled={state === MATERIAL_WORKFLOW_STATE.chunking || isLoading}
        onChange={
          state === MATERIAL_WORKFLOW_STATE.not_chunked ? onAdd : onRemove
        }
        size="small"
      />
    )
  );
};

export default KnowledgeBaseSwitch;
