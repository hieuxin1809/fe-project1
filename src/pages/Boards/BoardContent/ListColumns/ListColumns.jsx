import { useState } from "react";
import { Box, Stack, Typography, TextField, Button } from "@mui/material";
import { Column } from "./Column/Column";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { toast } from "react-toastify";

export const ListColumns = ({
  board,
  columns,
  createNewColumn,
  createNewCard,
  handleDeleteColumn,
  handleDeleteCard,
}) => {
  const [openNewColumn, setOpenNewColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState(false);

  const toggleOpenNewColumn = () => setOpenNewColumn(!openNewColumn);
  const addNewColumn = async () => {
    if (newColumnTitle) {
      const newColumnData = {
        title: newColumnTitle.trim(),
      };
      await createNewColumn(newColumnData);
      setOpenNewColumn();
      setNewColumnTitle();
      return;
    }
    toast.error("Bạn cần nhập tiêu đề cột");
  };
  return (
    <SortableContext
      items={columns?.map((c) => c._id)}
      strategy={horizontalListSortingStrategy}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          height: "100%",
        }}
      >
        {columns?.map((column) => {
          return (
            <Column
              board={board}
              key={column._id}
              column={column}
              createNewCard={createNewCard}
              handleDeleteColumn={handleDeleteColumn}
              handleDeleteCard={handleDeleteCard}
            />
          );
        })}
        {!openNewColumn ? (
          <Box
            sx={{
              minHeight: "44px",
              minWidth: "260px",
              display: "flex",
              alignItems: "center",
              fontWeight: 600,
              margin: "10px 10px",
              borderRadius: "12px",
              cursor: "pointer",
              background: "#aa6d8a",
              color: "#ffffff",
            }}
            onClick={() => toggleOpenNewColumn()}
          >
            <Stack flexDirection="row" alignItems="center" ml={1.5}>
              <AddIcon sx={{ fontSize: "17px" }} />
              <Typography
                sx={{
                  fontSize: "14px",
                  marginLeft: "5px",
                  fontWeight: "600",
                }}
              >
                Thêm danh sách khác
              </Typography>
            </Stack>
          </Box>
        ) : (
          <Box
            sx={{
              minWidth: "260px",
              alignItems: "center",
              fontWeight: 600,
              margin: "10px 10px",
              borderRadius: "12px",
              cursor: "pointer",
              background: "#101204",
              color: "#ffffff",
              padding: "12px",
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Nhập tiêu đề cột"
              autoFocus
              onChange={(e) => setNewColumnTitle(e.target.value)}
              sx={{
                backgroundColor: "#22272b",
                borderRadius: "8px",
                "& .MuiOutlinedInput-root": {
                  height: "36px",
                  fontSize: "14px",
                  "& fieldset": {
                    borderColor: "#444c56",
                  },
                  "&:hover fieldset": {
                    borderColor: "#666e76",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#888e96",
                  },
                },
                "& .MuiInputBase-input": {
                  color: "#ffffff",
                },
                "& .MuiInputBase-input::placeholder": {
                  color: "#b0b8c0",
                  opacity: 1,
                },
              }}
            />
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mt={1.5}
            >
              <Button
                variant="contained"
                sx={{
                  color: "#1d2125",
                  textTransform: "none",
                  fontSize: "13px",
                }}
                onClick={() => addNewColumn()}
              >
                Thêm danh sách
              </Button>
              <CloseIcon
                onClick={() => {
                  toggleOpenNewColumn();
                  setNewColumnTitle("");
                }}
                sx={{ color: "#b6c2cf" }}
              />
            </Stack>
          </Box>
        )}
      </Box>
    </SortableContext>
  );
};
