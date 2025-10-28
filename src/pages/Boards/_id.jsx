import { Box, Container } from "@mui/material";
import { BoardContent } from "./BoardContent/BoardContent";
import { useEffect, useState } from "react";
import {
  moveCardToDifferentColumnId,
  fetchBoardData,
  updateColumnData,
  createNewColumnAPI,
  createNewCardAPI,
  updateBoardData,
  deleteColumnData,
} from "../../apis";
import { generatePlaceholderCard } from "../../utils/formatter";
import { isEmpty } from "lodash";
import { mapOrder } from "../../utils/sort";

export const Board = ({ boardId, board, setBoard, setBoardId }) => {
  useEffect(() => {
    if (boardId) {
      fetchBoardData(boardId).then((board) => {
        board.columns = mapOrder(board?.columns, board?.columnOrderIds, "_id");
        board.columns.forEach((column) => {
          if (isEmpty(column.cards)) {
            column.cards = [generatePlaceholderCard(column)];
            column.cardOrderIds = [generatePlaceholderCard(column)._id];
          } else {
            column.cards = mapOrder(column?.cards, column?.cardOrderIds, "_id");
          }
        });
        setBoard(board);
      });
    }
  }, [boardId]);

  const createNewColumn = async (newColumnData) => {
    const createdColumn = await createNewColumnAPI({
      ...newColumnData,
      boardId: board._id,
    });
    createdColumn.cards = [generatePlaceholderCard(createdColumn)];
    createdColumn.cardOrderIds = [generatePlaceholderCard(createdColumn)._id];
    const newBoard = { ...board };
    newBoard.columns.push(createdColumn);
    newBoard.columnOrderIds.push(createdColumn._id);
    setBoard(newBoard);
  };

  const createNewCard = async (newCardData) => {
    const createdCard = await createNewCardAPI({
      ...newCardData,
      boardId: board._id,
    });
    const newBoard = { ...board };
    const columnToUpdate = newBoard.columns.find(
      (column) => column._id === createdCard.columnId
    );
    if (columnToUpdate) {
      if (columnToUpdate.cards.some((card) => card.FE_placeholderCard)) {
        columnToUpdate.cards = [createdCard];
        columnToUpdate.cardOrderIds = [createdCard._id];
      } else {
        columnToUpdate.cards.push(createdCard);
        columnToUpdate.cardOrderIds.push(createdCard._id);
      }
    }
    setBoard(newBoard);
  };

  const moveColumns = async (dndOrderColumns) => {
    const dndOrderColumnsIds = dndOrderColumns.map((c) => c._id);
    const newBoard = { ...board };
    newBoard.columns = dndOrderColumns;
    newBoard.columnOrderIds = dndOrderColumnsIds;
    setBoard(newBoard);
    await updateBoardData(newBoard._id, {
      columnOrderIds: dndOrderColumnsIds,
    });
  };

  const moveCardInTheSameColumn = async (
    dndOrderCards,
    dndOrderCardIds,
    columnId
  ) => {
    const newBoard = { ...board };
    const columnToUpdate = newBoard.columns.find(
      (column) => column._id === columnId
    );
    if (columnToUpdate) {
      columnToUpdate.cards = dndOrderCards;
      columnToUpdate.cardOrderIds = dndOrderCardIds;
    }
    setBoard(newBoard);
    updateColumnData(columnId, { cardOrderIds: dndOrderCardIds });
  };

  const moveCardToDifferentColumn = async (
    currentCardId,
    prevColumnId,
    nextColumnId,
    dndOrderColumns
  ) => {
    const dndOrderColumnsIds = dndOrderColumns.map((c) => c._id);
    const newBoard = { ...board };
    newBoard.columns = dndOrderColumns;
    newBoard.columnOrderIds = dndOrderColumnsIds;
    setBoard(newBoard);
    let prevCardOrderIds = dndOrderColumns.find(
      (c) => c._id === prevColumnId
    ).cardOrderIds;
    if (prevCardOrderIds[0].includes("placeholder-card")) prevCardOrderIds = [];

    await moveCardToDifferentColumnId({
      currentCardId,
      prevColumnId,
      nextColumnId,
      prevCardOrderIds,
      nextCardOrderIds: dndOrderColumns.find((c) => c._id === nextColumnId)
        ?.cardOrderIds,
    });
  };

  const handleDeleteColumn = async (columnId) => {
    deleteColumnData(columnId);
    const newBoard = { ...board };
    newBoard.columns = newBoard.columns.filter((c) => c._id !== columnId);
    newBoard.columnOrderIds = newBoard.columnOrderIds.filter(
      (_id) => _id !== columnId
    );
    setBoard(newBoard);
  };
  const handleDeleteCard = async () => {
    setBoardId(null);
    setTimeout(() => {
      setBoardId(board._id);
    }, 10);
  };
  if (!board || boardId == 0) {
    return <Box></Box>;
  }
  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        background: "#8f3f65",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        marginTop: "65px",
      }}
    >
      <BoardContent
        board={board}
        createNewColumn={createNewColumn}
        createNewCard={createNewCard}
        moveColumns={moveColumns}
        moveCardInTheSameColumn={moveCardInTheSameColumn}
        moveCardToDifferentColumn={moveCardToDifferentColumn}
        handleDeleteColumn={handleDeleteColumn}
        handleDeleteCard={handleDeleteCard}
      />
    </Container>
  );
};
