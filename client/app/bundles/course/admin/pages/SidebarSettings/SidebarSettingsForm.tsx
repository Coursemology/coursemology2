import { useState } from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from '@hello-pangea/dnd';
import { DragIndicator } from '@mui/icons-material';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material';
import { produce } from 'immer';
import { SidebarItem, SidebarItems } from 'types/course/admin/sidebar';

import { getComponentTitle } from 'course/translations';
import Section from 'lib/components/core/layouts/Section';
import { defensivelyGetIcon } from 'lib/constants/icons';
import useTranslation from 'lib/hooks/useTranslation';

import translations from './translations';

interface SidebarSettingsFormProps {
  data: SidebarItems;
  onSubmit: (
    data: SidebarItems,
    onSuccess: (newData: SidebarItems) => void,
    onError: () => void,
  ) => void;
  disabled?: boolean;
}

const Outlined = (props): JSX.Element => (
  <Paper variant="outlined" {...props} />
);

const SidebarSettingsForm = (props: SidebarSettingsFormProps): JSX.Element => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(props.data);

  const moveItem = (sourceIndex: number, destinationIndex: number): void => {
    const currentSettings = settings;
    const newOrdering = produce(settings, (draft) => {
      const [removed] = draft.splice(sourceIndex, 1);
      draft.splice(destinationIndex, 0, removed);
    });

    setSettings(newOrdering);

    const newSidebarItems = newOrdering.map((item, index) => ({
      id: item.id,
      title: item.title,
      weight: index + 1,
      icon: item.icon,
    }));

    props.onSubmit(newSidebarItems, setSettings, () =>
      setSettings(currentSettings),
    );
  };

  const rearrange = (result: DropResult): void => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    if (sourceIndex === destinationIndex) return;

    moveItem(sourceIndex, destinationIndex);
  };

  const vibrate =
    (strength = 100) =>
    () =>
      // Vibration will only activate once the user interacts with the page (taps, scrolls,
      // etc.) at least once. This is an expected HTML intervention. Read more:
      // https://html.spec.whatwg.org/multipage/interaction.html#tracking-user-activation
      navigator.vibrate?.(strength);

  const renderRows = (item: SidebarItem, index: number): JSX.Element => (
    <Draggable
      key={item.id}
      draggableId={item.id}
      index={index}
      isDragDisabled={props.disabled}
    >
      {(provided, { isDragging }): JSX.Element => {
        let transform = provided.draggableProps?.style?.transform;

        if (isDragging && transform) {
          // Reset the x-axis transform to prevent horizontal dragging
          transform = transform.replace(/\(.+,/, '(0,');
        }

        const style = {
          ...provided.draggableProps.style,
          transform,
        };

        const Icon = defensivelyGetIcon(item.icon, 'outlined');

        return (
          <TableRow
            ref={provided.innerRef}
            className={`w-full select-none ${
              isDragging && 'rounded-lg bg-white opacity-80 drop-shadow-md'
            }`}
            hover
            {...provided.draggableProps}
            style={style}
            {...provided.dragHandleProps}
          >
            <TableCell className="w-0 border-none">
              <DragIndicator
                className={props.disabled ? 'invisible' : ''}
                color="disabled"
                fontSize="small"
              />
            </TableCell>

            <TableCell className="w-0 border-none p-0">
              <Icon />
            </TableCell>

            <TableCell className="border-none">
              <Typography
                color={props.disabled ? 'text.disabled' : 'text.primary'}
                variant="body2"
              >
                {getComponentTitle(t, item.id, item.title)}
              </Typography>
            </TableCell>
          </TableRow>
        );
      }}
    </Draggable>
  );

  return (
    <Section
      sticksToNavbar
      subtitle={t(translations.sidebarSettingsSubtitle)}
      title={t(translations.sidebarSettings)}
    >
      <TableContainer className="overflow-hidden" component={Outlined}>
        <Table>
          <DragDropContext
            onDragEnd={rearrange}
            onDragStart={vibrate()}
            onDragUpdate={vibrate(30)}
          >
            <Droppable droppableId="droppable">
              {(provided): JSX.Element => (
                <TableBody ref={provided.innerRef} {...provided.droppableProps}>
                  {settings.map(renderRows)}
                  {provided.placeholder}
                </TableBody>
              )}
            </Droppable>
          </DragDropContext>
        </Table>
      </TableContainer>
    </Section>
  );
};

export default SidebarSettingsForm;
