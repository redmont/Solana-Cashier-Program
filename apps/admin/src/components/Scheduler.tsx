import {
  Box,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  GridItem,
  HStack,
  Heading,
  Icon,
  Radio,
  RadioGroup,
  SimpleGrid,
  Stack,
} from '@chakra-ui/react';
import {
  DndContext,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useState, useEffect } from 'react';
import { IoIosMenu } from 'react-icons/io';

export const TRASH_ID = 'void';

type Items = Record<string, { id: string; displayName: string }[]>;

const SortableSeriesItem = (props: any) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card borderColor="green.400" borderWidth="2px" borderStyle="solid">
        <CardBody padding="12px">{props.children}</CardBody>
      </Card>
    </div>
  );
};

const ScheduleContainer = ({ items }: { items: Items }) => {
  const { setNodeRef: scheduleSetNodeRef } = useDroppable({
    id: 'schedule',
  });

  return (
    <SortableContext
      id="schedule"
      items={items['schedule']}
      strategy={verticalListSortingStrategy}
    >
      <Box
        ref={scheduleSetNodeRef}
        alignItems="stretch"
        width="100%"
        minHeight="150px"
        border="3px solid #0000001a"
        borderRadius="6px"
        padding="5px"
        display="flex"
        flexDirection="column"
        gap="5px"
      >
        {items['schedule'].map((item) => (
          <SortableSeriesItem key={item.id} id={item.id}>
            <HStack
              alignItems="stretch"
              justifyContent="space-between"
              height="24px"
              gap="6"
            >
              <Box>{item.displayName}</Box>
              <Box>
                <Icon as={IoIosMenu} boxSize={6} />
              </Box>
            </HStack>
          </SortableSeriesItem>
        ))}
      </Box>
    </SortableContext>
  );
};

const SeriesContainer = ({ items }: { items: Items }) => {
  const { setNodeRef: seriesSetNodeRef } = useDroppable({
    id: 'series',
  });

  return (
    <SortableContext
      id="series"
      items={items['series']}
      strategy={verticalListSortingStrategy}
    >
      <Box
        ref={seriesSetNodeRef}
        minHeight="150px"
        border="3px solid #0000001a"
        borderRadius="6px"
        padding="5px"
        display="flex"
        flexDirection="column"
        gap="5px"
      >
        {items['series'].map((item) => (
          <SortableSeriesItem key={item.id} id={item.id}>
            <HStack
              alignItems="stretch"
              justifyContent="space-between"
              height="24px"
              gap="6"
            >
              <Box>{item.displayName}</Box>
              <Box>
                <Icon as={IoIosMenu} boxSize={6} />
              </Box>
            </HStack>
          </SortableSeriesItem>
        ))}
      </Box>
    </SortableContext>
  );
};

export const Scheduler = ({
  series,
  schedule,
  onNewSchedule,
}: {
  series: { id: string; displayName: string }[];
  schedule: { id: string; displayName: string }[];
  onNewSchedule: (newSchedule: string[]) => void;
}) => {
  const [items, setItems] = useState<Items>(() => ({
    schedule: [],
    series: [],
  }));

  useEffect(() => {
    if (series) {
      setItems((prevItems) => {
        // Create a new object with updated 'series' array
        return {
          ...prevItems,
          series: series.map(({ id, ...rest }) => ({
            id: `series-${id}`,
            ...rest,
          })),
        };
      });
    }
  }, [series]);

  const [activeId, setActiveId] = useState<string | null>(null);

  const findContainer = (id: string) => {
    if (id in items) {
      return id;
    }

    return Object.keys(items).find((key) =>
      items[key].find((x) => x.id === id),
    );
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = ({ active }: any) => {
    setActiveId(active.id);
  };

  const handleDragOver = ({ active, over }: any) => {
    const activeId = active.id;
    const overId = over?.id;
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    // if (overId == null || overId === TRASH_ID) {
    //   return;
    // }

    // if (activeContainer === 'schedule' && overContainer === 'series') {
    //   // Can't drag from schedule to series
    //   return;
    // }

    if (activeContainer && overContainer && activeContainer !== overContainer) {
      setItems((items) => {
        const activeItems = items[activeContainer];
        const overItems = items[overContainer];

        const activeItem = activeItems.find((x) => x.id === activeId);
        const overItem = overItems.find((x) => x.id === overId);

        if (!activeItem) {
          return items;
        }

        const activeIndex = activeItems.indexOf(activeItem);
        const overIndex = overItem ? overItems.indexOf(overItem) : -1;

        let newIndex: number;
        if (overId in items) {
          newIndex = overItems.length + 1;
        } else {
          const isBelowOverItem =
            over &&
            active.rect.current.translated &&
            active.rect.current.translated.top >
              over.rect.top + over.rect.height;

          const modifier = isBelowOverItem ? 1 : 0;

          newIndex =
            overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
        }

        // recentlyMovedToNewContainer.current = true; <-- todo

        //const item = { ... };
        //item.id = item.id.replace(activeContainer, overContainer);

        const newitems = {
          ...items,
          [activeContainer]: items[activeContainer].filter(
            (item) => item !== activeId,
          ),
          [overContainer]: [
            ...items[overContainer].slice(0, newIndex),
            items[activeContainer][activeIndex],
            ...items[overContainer].slice(
              newIndex,
              items[overContainer].length,
            ),
          ],
        };

        return newitems;
      });
    }
  };

  const handleDragEnd = ({ active, over }: any) => {
    if (active.id in items && over?.id) {
    }

    const activeId = active.id;
    const overId = over?.id;

    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer) {
      setActiveId(null);
      return;
    }

    if (overId == null) {
      setActiveId(null);
      return;
    }

    // if (overId === TRASH_ID) {
    //   setItems((items) => ({
    //     ...items,
    //     [activeContainer]: items[activeContainer].filter(
    //       (item) => item.id !== activeId,
    //     ),
    //   }));
    //   setActiveId(null);
    //   return;
    // }

    //   if (overId === PLACEHOLDER_ID) {
    //     const newContainerId = getNextContainerId();

    //     unstable_batchedUpdates(() => {
    //       setContainers((containers) => [...containers, newContainerId]);
    //       setItems((items) => ({
    //         ...items,
    //         [activeContainer]: items[activeContainer].filter(
    //           (id) => id !== activeId
    //         ),
    //         [newContainerId]: [active.id],
    //       }));
    //       setActiveId(null);
    //     });
    //     return;
    //   }

    if (overContainer) {
      const activeItem = items[activeContainer].find((x) => x.id === activeId);
      const overItem = items[overContainer].find((x) => x.id === overId);

      if (activeItem !== undefined && overItem !== undefined) {
        const activeIndex = items[activeContainer].indexOf(activeItem);
        const overIndex = items[overContainer].indexOf(overItem);

        if (activeIndex !== overIndex) {
          setItems((items) => ({
            ...items,
            [overContainer]: arrayMove(
              items[overContainer],
              activeIndex,
              overIndex,
            ),
          }));
        }
      }
    }

    setActiveId(null);

    onNewSchedule(
      items['schedule'].map((x) => {
        const [_, ...id] = x.id.split('-');
        return id.join('-');
      }),
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SimpleGrid minWidth="500px" columns={2} spacing={4}>
        <GridItem>
          <Heading as="h3" size="md" mb="4">
            Schedule
          </Heading>
          <ScheduleContainer items={items} />
        </GridItem>
        <GridItem>
          <Heading as="h3" size="md" mb="4">
            Series
          </Heading>
          <SeriesContainer items={items} />
          {/* <DragOverlay /> */}
        </GridItem>
      </SimpleGrid>
    </DndContext>
  );
};
