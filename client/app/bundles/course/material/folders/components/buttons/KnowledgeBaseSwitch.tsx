import { FC, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { Switch } from '@mui/material';

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
  state: 'not_chunked' | 'chunking' | 'chunked' | null;
  type: 'subfolder' | 'material';
}

const translations = defineMessages({
  addSuccess: {
    id: 'course.material.folders.WorkbinTableButtons.addFailure',
    defaultMessage: ' has been added to knowledge base',
  },
  addFailure: {
    id: 'course.material.folders.WorkbinTableButtons.addFailure',
    defaultMessage: ' could not be added to knowledge base',
  },
  removeSuccess: {
    id: 'course.material.folders.WorkbinTableButtons.removeSuccess',
    defaultMessage: ' has been removed from knowledge base',
  },
  removeFailure: {
    id: 'course.material.folders.WorkbinTableButtons.removeFailure',
    defaultMessage: ' could not be removed from knowledge base',
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
          toast.success(`"${itemName}" ${t(translations.addSuccess)}`);
        },
        () => {
          setIsLoading(false);
          toast.error(`"${itemName}" ${t(translations.addFailure)}`);
        },
      ),
    );
  };

  const onRemove = (): Promise<void> => {
    setIsLoading(true);
    return dispatch(removeChunks(currFolderId, itemId))
      .then(() => {
        setIsLoading(false);
        toast.success(`"${itemName}" ${t(translations.removeSuccess)}`);
      })
      .catch((error) => {
        setIsLoading(false);
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          `"${itemName}" ${t(translations.removeFailure)} - ${errorMessage}`,
        );
        throw error;
      });
  };

  useEffect(() => {
    if (state === 'chunking' && !isLoading) {
      onAdd();
      setIsLoading(true);
    }
  }, [isLoading]);

  return (
    type === 'material' &&
    canEdit &&
    isConcrete && (
      <Switch
        checked={state === 'chunked'}
        color="primary"
        disabled={state === 'chunking' || isLoading}
        onChange={state === 'not_chunked' ? onAdd : onRemove}
        size="small"
      />
    )
  );
};

export default KnowledgeBaseSwitch;
