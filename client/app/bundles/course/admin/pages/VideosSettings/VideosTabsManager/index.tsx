import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { Add } from '@mui/icons-material';
import { Button, Paper } from '@mui/material';
import { produce } from 'immer';
import { VideosTab } from 'types/course/admin/videos';

import useTranslation from 'lib/hooks/useTranslation';

import translations from '../translations';

import Tab from './Tab';

interface VideosTabsManagerProps {
  tabs: VideosTab[];
  onUpdate?: (data: VideosTab[]) => void;
  onCreateTab?: (
    title: VideosTab['title'],
    weight: VideosTab['weight'],
  ) => void;
  onDeleteTab?: (id: VideosTab['id'], title: VideosTab['title']) => void;
  canCreateTabs?: boolean;
  disabled?: boolean;
}

const VideosTabsManager = (props: VideosTabsManagerProps): JSX.Element => {
  const { tabs } = props;
  const { t } = useTranslation();

  const renameTab = (index: number, newTitle: VideosTab['title']): void =>
    props.onUpdate?.(
      produce(tabs, (draft) => {
        draft[index].title = newTitle;
      }),
    );

  const createTab = (): void =>
    props.onCreateTab?.(
      t(translations.newVideosTabDefaultTitle),
      tabs[tabs.length - 1].weight + 1,
    );

  const moveTab = (sourceIndex: number, destinationIndex: number): void => {
    const newTabs = produce(tabs, (draft) => {
      const [removed] = draft.splice(sourceIndex, 1);
      draft.splice(destinationIndex, 0, removed);
    });

    props.onUpdate?.(
      newTabs.map((item, index) => ({
        ...item,
        weight: index + 1,
      })),
    );
  };

  const rearrange = (result: DropResult): void => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    if (sourceIndex === destinationIndex) return;

    moveTab(sourceIndex, destinationIndex);
  };

  const vibrate =
    (strength = 100) =>
    () =>
      // Vibration will only activate once the user interacts with the page (taps, scrolls,
      // etc.) at least once. This is an expected HTML intervention. Read more:
      // https://html.spec.whatwg.org/multipage/interaction.html#tracking-user-activation
      navigator.vibrate?.(strength);

  const renderTabs = (): JSX.Element[] =>
    tabs.map((tab, index) => (
      <Tab
        key={tab.id}
        disabled={props.disabled}
        index={index}
        onDelete={props.onDeleteTab}
        onRename={renameTab}
        tab={tab}
      />
    ));

  return (
    <>
      {props.canCreateTabs && (
        <Button
          disabled={props.disabled}
          onClick={createTab}
          startIcon={<Add />}
        >
          {t(translations.addATab)}
        </Button>
      )}

      <Paper variant="outlined">
        <DragDropContext
          onDragEnd={rearrange}
          onDragStart={vibrate()}
          onDragUpdate={vibrate(30)}
        >
          <Droppable droppableId="droppable">
            {(provided): JSX.Element => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {renderTabs()}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </Paper>
    </>
  );
};

export default VideosTabsManager;
