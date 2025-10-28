import { Stack } from "@mui/material";
import { ListColumns } from "./ListColumns/ListColumns";
import {
  closestCorners,
  DndContext,
  getFirstCollision,
  pointerWithin,
} from "@dnd-kit/core";
import { useEffect, useState, useCallback, useRef } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { cloneDeep, isEmpty } from "lodash";
import { generatePlaceholderCard } from "../../../utils/formatter";

export const BoardContent = ({
  board,
  createNewColumn,
  createNewCard,
  moveColumns,
  moveCardInTheSameColumn,
  moveCardToDifferentColumn,
  handleDeleteColumn,
  handleDeleteCard,
}) => {
  const [orderColumns, setOrderColumns] = useState([]);
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] =
    useState(null);
  const [type, setType] = useState("");
  const lastOverId = useRef(null);
  useEffect(() => {
    setOrderColumns(board?.columns);
  }, [board]);

  const handleDragStart = (e) => {
    const { active } = e;

    if (e.active.data.current.columnId) {
      setOldColumnWhenDraggingCard(findColumnByCardId(e.active.id));
    }

    if (active.id.includes("card")) setType("card");
    if (active.id.includes("column")) setType("column");
  };
  const handleDragEnd = (e) => {
    const { over, active } = e;

    if (!over || !active) return;
    if (active.id != over.id) {
      const oldIndex = orderColumns.findIndex((c) => c._id === active.id);
      const newIndex = orderColumns.findIndex((c) => c._id === over.id);
      const dndOrderColumns = arrayMove(orderColumns, oldIndex, newIndex);
      setOrderColumns(dndOrderColumns);
      moveColumns(dndOrderColumns);
    }
    const {
      id: activeId,
      data: { current: activeData },
    } = active;
    const { id: overId } = over;
    const activeColumn = findColumnByCardId(activeId);
    const overColumn = findColumnByCardId(overId);
    if (!activeColumn || !overColumn) return;
    if (oldColumnWhenDraggingCard._id !== overColumn._id) {
      moveCardBetweenDifferentColumns(
        overColumn,
        overId,
        active,
        over,
        activeColumn,
        activeData,
        activeId,
        "handleDragEnd"
      );
    } else {
      const oldCardIndex = oldColumnWhenDraggingCard.cards.findIndex(
        (c) => c._id === activeId
      );
      const newCardIndex = overColumn.cards.findIndex((c) => c._id === overId);
      const dndOrderCards = arrayMove(
        oldColumnWhenDraggingCard.cards,
        oldCardIndex,
        newCardIndex
      );
      const dndOrderCardIds = dndOrderCards.map((card) => card._id);

      setOrderColumns((prev) => {
        const nextColumns = cloneDeep(prev);
        const targetColumn = nextColumns.find(
          (column) => column._id === overColumn._id
        );
        targetColumn.cards = dndOrderCards;
        targetColumn.cardOrderIds = dndOrderCardIds;
        return nextColumns;
      });
      moveCardInTheSameColumn(
        dndOrderCards,
        dndOrderCardIds,
        oldColumnWhenDraggingCard._id
      );
    }
    setOldColumnWhenDraggingCard(null);
  };
  const findColumnByCardId = (cardId) => {
    return orderColumns.find((column) =>
      column.cards.map((card) => card._id)?.includes(cardId)
    );
  };

  const moveCardBetweenDifferentColumns = (
    overColumn,
    overId,
    active,
    over,
    activeColumn,
    activeData,
    activeId,
    triggerFrom
  ) => {
    setOrderColumns((prev) => {
      const overCardIndex = overColumn?.cards?.findIndex(
        (card) => card._id === overId
      );
      let newCardIndex;
      const isBelowOverItem =
        active.rect.current.translated &&
        active.rect.current.translated.top > over.rect.top + over.rect.height;
      const modifier = isBelowOverItem ? 1 : 0;
      newCardIndex =
        overCardIndex >= 0
          ? overCardIndex + modifier
          : overColumn?.card?.length + 1;
      const nextColumns = cloneDeep(prev);
      const nextActiveColumn = nextColumns.find(
        (column) => column._id === activeColumn._id
      );
      const nextOverColumn = nextColumns.find(
        (column) => column._id === overColumn._id
      );
      if (nextActiveColumn) {
        nextActiveColumn.cards = nextActiveColumn.cards.filter(
          (card) => card._id !== activeId
        );

        if (isEmpty(nextActiveColumn.cards)) {
          nextActiveColumn.cards = [generatePlaceholderCard(nextActiveColumn)];
        }

        nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(
          (card) => card._id
        );
      }
      if (nextOverColumn) {
        nextOverColumn.cards = nextOverColumn.cards.filter(
          (card) => card._id !== activeId
        );
        const rebuild_activeData = {
          ...activeData,
          columnId: nextOverColumn._id,
        };
        nextOverColumn.cards = nextOverColumn.cards.toSpliced(
          newCardIndex,
          0,
          rebuild_activeData
        );
        nextOverColumn.cards = nextOverColumn.cards.filter(
          (card) => !card.FE_placeholderCard
        );
        nextOverColumn.cardOrderIds = nextOverColumn.cards.map(
          (card) => card._id
        );
      }
      if (triggerFrom == "handleDragEnd") {
        moveCardToDifferentColumn(
          activeId,
          oldColumnWhenDraggingCard._id,
          nextOverColumn._id,
          nextColumns
        );
      }
      return nextColumns;
    });
  };

  const handleDragOver = (e) => {
    const { over, active } = e;
    if (!over || !active) return;
    const {
      id: activeId,
      data: { current: activeData },
    } = active;
    const { id: overId } = over;
    const activeColumn = findColumnByCardId(activeId);
    const overColumn = findColumnByCardId(overId);
    if (!activeColumn || !overColumn) return;
    if (activeColumn._id !== overColumn._id) {
      moveCardBetweenDifferentColumns(
        overColumn,
        overId,
        active,
        over,
        activeColumn,
        activeData,
        activeId,
        "handleDragOver"
      );
    }
  };
  const collisionDetectionStrategy = useCallback(
    (args) => {
      if (type === "column") {
        return closestCorners(args);
      }

      // Lấy danh sách các điểm va chạm
      const pointerIntersections = pointerWithin(args);
      console.log(pointerIntersections);
      if (!pointerIntersections?.length) return;

      let overId = getFirstCollision(pointerIntersections);

      if (overId) {
        // Nếu overId là một column, thì kiểm tra lại để tránh bị nhảy cột bất thường
        const checkColumn = orderColumns.find((c) => c._id === overId);
        if (checkColumn) {
          overId = closestCorners({
            ...args,
            droppableContainers: args.droppableContainers.filter((c) => {
              return (
                c.id !== overId && checkColumn?.cardOrderIds?.includes(c.id)
              );
            })[0]?.id,
          });
        }

        lastOverId.current = overId;
        return [{ id: overId }];
      }

      // return closestCorners({ ...args });
      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [type, orderColumns]
  );

  return (
    <DndContext
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
    >
      <Stack
        flexDirection="row"
        alignItems="flex-start"
        sx={{
          overflow: "auto",
          height: "100%",
          scrollbarWidth: "thin",
          scrollbarColor: "#323b36 #101204",
          "&::-webkit-scrollbar": {
            width: "6px",
          },
        }}
      >
        <ListColumns
          columns={orderColumns}
          createNewColumn={createNewColumn}
          createNewCard={createNewCard}
          handleDeleteColumn={handleDeleteColumn}
          handleDeleteCard={handleDeleteCard}
          board={board}
        />
      </Stack>
    </DndContext>
  );
};
