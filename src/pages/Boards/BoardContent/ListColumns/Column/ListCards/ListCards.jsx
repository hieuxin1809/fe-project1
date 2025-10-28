import { Box } from "@mui/material";
import { Card } from "./Card/Card";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

export const ListCards = ({ cards, handleDeleteCard, board }) => {
  return (
    <SortableContext
      items={cards?.map((c) => c._id)}
      strategy={verticalListSortingStrategy}
    >
      <Box
        sx={{
          overflow: "auto",
          maxHeight: "500px",
          scrollbarWidth: "thin", // Firefox
          scrollbarColor: "#323b36 #101204", // Màu thanh cuộn (nền, thanh)
          "&::-webkit-scrollbar": {
            width: "6px", // Độ rộng thanh cuộn
          },
          // "&::-webkit-scrollbar-track": {
          //   background: "#101204", // Màu nền thanh cuộn
          //   borderRadius: "6px",
          // },
          // "&::-webkit-scrollbar-thumb": {
          //   background: "#1e1e1e", // Màu thanh cuộn
          //   borderRadius: "6px",
          // },
          // "&::-webkit-scrollbar-thumb:hover": {
          //   background: "#333", // Màu khi hover
          // },
        }}
      >
        {cards?.map((card) => {
          return (
            <Card
              board={board}
              key={card._id}
              card={card}
              handleDeleteCard={handleDeleteCard}
            />
          );
        })}
      </Box>
    </SortableContext>
  );
};
